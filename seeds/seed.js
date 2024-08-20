const sequelize = require('../config/connection');
const {Product, Customers, TransactionsDetail, TransactionsMain} = require('../models');

const productData = require('./productData.json');
const customerData = require('./customerData.json');
const transactiondetailData = require('./transactiondetail.json');
const transactionmainData = require('./transactionmain.json');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  await Product.bulkCreate(productData, {
    individualHooks: true,
    returning: true,
  });
  await Customers.bulkCreate(customerData, {
    individualHooks: true,
    returning: true,
  });
  await TransactionsMain.bulkCreate(transactionmainData, {
    individualHooks: true,
    returning: true,
  });
 await TransactionsDetail.bulkCreate(transactiondetailData, {
   individualHooks: true,
    returning: true,
  });
  
  process.exit(0);
};

seedDatabase();