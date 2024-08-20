const router = require('express').Router();
const withAuth = require('../../utils/auth.js');
const sequelize = require('../../config/connection.js');

router.post('/:id', async (req, res) => {
  const { total, customer_id, created_date, ordered, product_id, dordered } = req.body;
  try {
    // Step 1: Check if there is an existing transaction for the customer
    const selectQuery = `
      SELECT transaction_id
      FROM transactionsMains
      WHERE customer_id = :customer_id AND ordered = 0
      ORDER BY transaction_id DESC
      LIMIT 1
    `;
    const [transaction] = await sequelize.query(selectQuery, {
      replacements: { customer_id },
      type: sequelize.QueryTypes.SELECT
    });
    let transaction_id;
    if (transaction) {
      // If record exists, get the transaction_id
      transaction_id = transaction.transaction_id;
    } else {
      // If no record exists, insert a new record into TransactionsMains
      const insertTransactionMainsQuery = `
        INSERT INTO transactionsMains (total, customer_id, created_date, ordered)
        VALUES (:total, :customer_id, :created_date, :ordered)
      `;
      const result = await sequelize.query(insertTransactionMainsQuery, {
        replacements: { total, customer_id, created_date, ordered },
        type: sequelize.QueryTypes.INSERT
      });
      // Retrieve the transaction_id of the newly inserted record
      const newTransaction = await sequelize.query(`
        SELECT transaction_id
        FROM transactionsMains
        WHERE customer_id = :customer_id
        ORDER BY transaction_id DESC
        LIMIT 1
      `, {
        replacements: { customer_id },
        type: sequelize.QueryTypes.SELECT
      });
      transaction_id = newTransaction[0].transaction_id;
    }
    // Insert into TransactionsDetails
    const insertTransactionDetailsQuery = `
      INSERT INTO transactionsDetails (transaction_id, product_id, ordered)
      VALUES (:transaction_id, :product_id, :dordered)
    `;
    await sequelize.query(insertTransactionDetailsQuery, {
      replacements: { transaction_id, product_id, dordered },
      type: sequelize.QueryTypes.INSERT
    });
    res.json({ success: true, transaction_id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;