const router = require('express').Router();
const { Product , Customers} = require('../models');

//adding Auth 
const withAuth = require('../utils/auth');
const sequelize = require('../config/connection');

//* FELIX'S CODE HERE:
// Login route
router.get('/login', (req, res) => {
  // If the customer is already logged in, redirect to the homepage
  if (req.session.loggedIn) {
    res.redirect('/products');
    return;
  }
  // Otherwise, render the 'login' template
  res.render('login');
});

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

// Logout route
router.get('/logout', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/products');
    return;
  }
  res.render('login');
});

router.get('/', (req, res) => {
  res.redirect('/products');
});
//* FELIX'S CODE ENDS HERE!

router.get('/products', async (req, res) => {
  try {
    const productData = await Product.findAll({
      order: [['product_name', 'ASC']],
    });
    const Products = productData.map((project) => project.get({ plain: true }));
    const customerData = await Customers.findAll({
      order: [['customer_id', 'ASC']],
    });
    const customerVar = customerData.map((project) => project.get({ plain: true }));

  res.render('productsPage', { 
    title: 'Products',
    Products,
    customerVar,
    loggedIn: req.session.loggedIn
  });
} catch (err) {
  res.status(500).json(err);
}
});

router.get('/products/:id',  async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id);
    const Products = productData.get({ plain: true });

    const customerData = await Customers.findAll({
      order: [['customer_id', 'ASC']],
    });
    const customerVar = customerData.map((project) => project.get({ plain: true }));
    
    res.render('productDetailsPage', {
      Products,
      customerVar,
      loggedIn: req.session.loggedIn,
      customer_id: req.session.customer_id
    });
    
  } catch (err) {
    res.status(500).json(err);
  }
});
//shopping cart page
router.get('/shoppingCart', withAuth, async (req, res) => {
  try {
    //raw sql data to pull values needed to display on shopping cart page
    const sqlQuery = `
      SELECT 
        c.customer_id, 
        p.product_url,
        p.product_name,
        p.price,
        tm.total,
        tm.transaction_id,
        COUNT(p.product_name) AS QTY,
        (SELECT SUM(p2.price) 
          FROM products p2
          JOIN transactionsDetails td2 ON p2.Product_id = td2.Product_id
          JOIN transactionsMains tm2 ON td2.Transaction_id = tm2.transaction_id
          JOIN customers c2 ON tm2.customer_id = c2.customer_id
          WHERE c2.customer_id = ${req.session.customer_id} AND td2.ordered = 0
        ) AS totalPrice
      FROM 
        customers c
      JOIN 
        transactionsMains tm ON c.customer_id = tm.customer_id
      JOIN 
        transactionsDetails td ON tm.transaction_id = td.Transaction_id
      JOIN 
        products p ON td.Product_id = p.Product_id
      WHERE
        c.customer_id = ${req.session.customer_id} AND td.ordered = 0
      GROUP BY 
        p.price, tm.transaction_id, c.customer_id,p.product_url, p.product_name, tm.total
    `;
    //running raw sql query
    const [results] = await sequelize.query(sqlQuery);
    
    //passing it as an object 
    const serializedData = results.map((data) => ({
      product_name: data.product_name,
      transaction_id: data.transaction_id,
      product_url: data.product_url,
      price: parseInt(data.price).toFixed(2),
      quantity: data.QTY,
      totalCost: parseInt(data.price * data.QTY).toFixed(2),
      subtotalPrice: parseInt(data.totalPrice).toFixed(2),
      tax: 9,
      finalPrice: (data.totalPrice * 1.09).toFixed(2)     
    }));
    //passing it through to the shopping cart page
    res.render('shoppingCart', {
      title: 'Shopping Cart',
      data:serializedData,
      loggedIn: req.session.loggedIn
    });
    
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/orderDetail/:id', withAuth, async (req, res) => {
  try {
    const sqlQuery = `
      SELECT 
        tm.transaction_id,
        p.product_id,
        p.product_name,
        p.product_description,
        sum(p.price) as total,
        p.product_url,
        COUNT(p.product_name) AS QTY,
        (SELECT SUM(p2.price) 
          FROM products p2
          JOIN transactionsDetails td2 ON p2.product_id = td2.product_id
          JOIN transactionsMains tm2 ON td2.Transaction_id = tm2.transaction_id
          JOIN customers c2 ON tm2.customer_id = c2.customer_id
          WHERE c2.customer_id = ${req.session.customer_id} AND td2.ordered = 1
        ) AS totalPrice
      FROM 
        customers c
      JOIN 
        transactionsMains tm ON c.customer_id = tm.customer_id
      JOIN 
        transactionsDetails td ON tm.transaction_id = td.Transaction_id
      JOIN 
        products p ON td.product_id = p.product_id
      WHERE 
        tm.transaction_id = ${req.params.id}
      GROUP BY 
        p.product_id,tm.transaction_id, p.product_name, p.product_description, p.product_url;
      `;

    const [results] = await sequelize.query(sqlQuery);

    const serializedData = results.map((data) => ({
      transaction_id: data.transaction_id,
      product_id: data.product_id,
      product_name: data.product_name,
      product_description: data.product_description,
      total: (data.total *1.09).toFixed(2),
      product_url: data.product_url,
      Qty: data.QTY,
      finalPrice: (data.totalPrice * 1.09).toFixed(2),
      singlePrice: data.total / data.QTY            
    }));

    res.render('orderDetail', { 
      data: serializedData,
      loggedIn: req.session.loggedIn 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/ordermain', withAuth, async (req, res) => {
  try {
    const sqlQuery = `
      SELECT
        c.first_name,
        c.last_name,
        tm.transaction_id,
        tm.created_date,
        c.customer_id,
        tm.ordered,
        SUM(p.price) AS total_price
      FROM 
          customers c
      JOIN 
          transactionsMains tm ON c.customer_id = tm.customer_id
      JOIN 
          transactionsDetails td ON tm.transaction_id = td.Transaction_id
      JOIN 
          products p ON td.product_id = p.product_id
      WHERE c.customer_id = ${req.session.customer_id} AND tm.ordered = 1
      GROUP BY 
          tm.transaction_id,tm.created_date, c.customer_id;
      `;

    const [results] = await sequelize.query(sqlQuery);

    const serializedData = results.map((data) => ({
      transaction_id: data.transaction_id,
      created_date: data.created_date,
      customer_id : data.customer_id,
      first_name: data.first_name,
      last_name: data.last_name,
      total:( data.total_price *1.09).toFixed(2),
      ordered: data.ordered
      
    }));

    res.render('orderMain', { 
      data: serializedData,
      loggedIn: req.session.loggedIn
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



router.get('/transactionComplete/:id', withAuth, async (req,res) => {
  try {
    const sqlQuery = `
      SELECT 
        tm.transaction_id,
        sum(p.price) * 1.09 as total
      FROM 
        customers c
      JOIN 
        transactionsMains tm ON c.customer_id = tm.customer_id
      JOIN 
        transactionsDetails td ON tm.transaction_id = td.Transaction_id
      JOIN 
        products p ON td.Product_id = p.Product_id
      WHERE
        tm.transaction_id = ${req.params.id}
      GROUP BY 
        tm.transaction_id;
      `;

    const [results] = await sequelize.query(sqlQuery);

    const serializedData = results.map((data) => ({
      transaction_id: data.transaction_id,
      total: parseFloat( data.total).toFixed(2)
    }));

    res.render('transactionComplete', { 
      data: serializedData,
      loggedIn: req.session.loggedIn
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;