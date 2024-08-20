const Product = require('./Items');
const Customers = require('./customers');
const TransactionsMain = require('./transactionmains');
const TransactionsDetail = require('./transactiondetails');

Customers.hasOne(TransactionsMain, {
    foreignKey: 'customer_id',
    onDelete: 'CASCADE'
});

TransactionsMain.belongsTo(Customers, {
    foreignKey: 'customer_id',
});

TransactionsMain.hasMany(TransactionsDetail, {
    foreignKey: 'transaction_id',
    onDelete: 'CASCADE'
});

TransactionsDetail.belongsTo(TransactionsMain, {
    foreignKey: 'transaction_id',
});

Product.hasMany(TransactionsDetail, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
});

TransactionsDetail.belongsTo(Product, {
    foreignKey: 'product_id',
});


module.exports = 
{   
    Product,
    Customers,
    TransactionsMain,
    TransactionsDetail
};
    