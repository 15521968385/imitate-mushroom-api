// post请求前端data服务器req.body
// get请求前端params服务器req.query
const express = require('express');
const mysql = require('mysql');

const app = express();



//解决post请求，req.body
const bodyParser = require('body-parser') // 引入body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//跨域处理
app.all('*', function (req, res, next) {
  // console.log(req.method);
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-type');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
  res.header('Access-Control-Max-Age', 1728000);//预请求缓存20天
  next();
});

//数据库配置
const db = mysql.createConnection({
  multipleStatements: true,
  host: 'localhost',
  port: '3307',
  user: 'root',
  password: 'root',
  database: 'imitate-mushroom',

})

//连接数据库
db.connect(err => {
  if (err) throw err;
  console.log('数据库连接成功');
})

//查询首页数据
app.get('/queryhomedatas', (req, res) => {
  let sql = `
  select * from banner;
  select * from categroy;
  select * from categroy_base;
  select *,price*discount*0.1 AS prices from goods where categroy_base_id=1 LIMIT 0,10;
  select *,price*discount*0.1 AS prices from goods where categroy_base_id=2 LIMIT 0,10;
  select *,price*discount*0.1 AS prices from goods where categroy_base_id=3 LIMIT 0,10;
  `
  db.query(sql, (err, result) => {
    if (err) throw err;
    // console.log(result);
    let [banner, categroy, categroy_base_title, categroy_base_item1, categroy_base_item2, categroy_base_item3] = result;
    let sult = { banner, categroy, categroy_base_title, categroy_base_item1, categroy_base_item2, categroy_base_item3 }

    res.send(sult)
  })
})

//根据索引查首页bannerItem数据(http://localhost:2000/querybanneritem?banner_id=1)
app.get('/querybanneritem', (req, res) => {
  let sql = `
  select * from banner_item where banner_id =${req.query.banner_id}
  `
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

//根据索引查询商品分类数据()
app.get('/querycategoodsbybase', (req, res) => {
  let sql = `
  select *,price*discount*0.1 AS prices from goods where categroy_base_id=${req.query.categroy_id} limit  ${req.query.start},10;
  `
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

// 根据索引查询商品详情数据
app.get('/querygooddata', (req, res) => {
  let sql = `
  select * from goods where id=${req.query.good_id};
  select * from goods_banner where goods_id=${req.query.good_id};
  SELECT * FROM service,goods_service WHERE service.id=goods_service.service_id AND goods_id=${req.query.good_id};
  select * from color where goods_id=${req.query.good_id};
  SELECT * FROM size,goods_size WHERE size.id=goods_size.size_id AND goods_id=${req.query.good_id};
  select * from pinglun_categroy,goods_pingluncate where pinglun_categroy.id=goods_pingluncate.pingluncate_id and goods_id=${req.query.good_id};
  select * from pinglun where goods_id=${req.query.good_id};
  SELECT * FROM canshu_title,goods_canshu WHERE goods_canshu.canshu_title_id=canshu_title.id AND goods_canshu.goods_id=${req.query.good_id};
  select *,price*discount*0.1 AS prices from goods where categroy_base_id=${req.query.categroybase_id};
  select * from guige where goods_id=${req.query.good_id};
  `
  db.query(sql, (err, result) => {
    if (err) throw err;
    let [baseinfo, banner, service, color, size, pinglun_categroy, pinglun, canshu, tuijian,guige] = result;
    let sult = { baseinfo, banner, service, color, size, pinglun_categroy, pinglun, canshu, tuijian,guige }
    
    
    res.send(sult)
  })
})

// 查询购物车数据
app.get('/querycartdata', (req, res) => {
  let sql = `
  select *,FORMAT(price,2) AS prices from cart
  `
  db.query(sql, (err, result) => {
    if (err) throw err;

    res.send(result)
  })
})

//根据索引查询购物车数据
app.get('/querycartdatabyid/:id', (req, res) => {
  let sql = `
  select * from cart where id=${req.params.id}
  `
  db.query(sql, (err, result) => {
    if (err) throw err;

    res.send(result)
  })
})

// 添加到购物车
app.post('/addcart', (req, res) => {
  let post = req.body;
  let sql = `insert into cart set ?`;
  db.query(sql, post, (err, result) => {
    if (err) throw err;

    res.send(result)
  })
})

// 根据id修改购物车checked
app.post('/updatecartcheck/:id', (req, res) => {
  //  问号一一对应ps数组元素
  let sql = `UPDATE cart set checked=? WHERE id = ${req.params.id}`;
  let ps = [req.body.checked]

  db.query(sql, ps, (err, result) => {
    if (err) throw err;
    console.log('修改成功');
    res.send('修改成功')
  })
})

// 修改全部购物车checked
app.post('/updateallcartcheck', (req, res) => {
  //  问号一一对应ps数组元素
  let sql = `UPDATE cart set checked=?`;
  let ps = [req.body.checked]

  db.query(sql, ps, (err, result) => {
    if (err) throw err;
    console.log('修改成功');
    res.send('修改成功')
  })
})
// 根据id删除购物车数据
app.get('/deletecartdatabyid/:id', (req, res) => {
  let sql = `delete from cart where id=${req.params.id}`;
  console.log(req.params.id)
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log('删除成功');
    res.send('删除成功')
  })
})

// 获取购物车全选数据
app.get('/queryselectall', (req, res) => {
  let sql = `
  select select_all from other
  `
  db.query(sql, (err, result) => {
    if (err) throw err;

    res.send(result)
  })
})

// 修改购物车全选数据
app.post('/updateselectall', (req, res) => {
  //  问号一一对应ps数组元素
  let sql = `UPDATE other set select_all=?`;
  let ps = [req.body.select_all]

  db.query(sql, ps, (err, result) => {
    if (err) throw err;
    console.log('修改成功');
    res.send('修改成功')
  })
})

// 获取横分类数据
app.get('/queryfenleiview', (req, res) => {
  let sql = `
  select * from categroy;
  select * from goods
  `
  db.query(sql, (err, result) => {
    if (err) throw err;
    let [categroy,goods]=result;
    let sult={
      categroy,
      goods
    }

    res.send(sult)
  })
})



// girls
app.get('/query', (req, res) => {
  let sql = `
  select title,content from biaoti,goods_biaoti where  biaoti.id=goods_biaoti.biaoti_id and goods_biaoti.good_id=1
  `
  db.query(sql, (err, result) => {
    if (err) throw err;

    // for(let item of  result){
    //   console.log(item.biaoti_id);
      
      
    // }
    

    res.send(result)
  })
})












//监听
app.listen('2000', () => {
  console.log('server started on port 2000')
})