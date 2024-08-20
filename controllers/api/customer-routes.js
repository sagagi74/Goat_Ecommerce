const router = require('express').Router();
const { Customers } = require('../../models');

// CREATE new customer
router.post('/', async (req, res) => {
  try {
    const dbCustomerData = await Customers.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email_address: req.body.email_address,
      password: req.body.password,
    });
    
    req.session.save(() => {
      res.status(200).json(dbCustomerData);
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const dbCustomerData = await Customers.findOne({ where: { email_address: req.body.email } });
    if (!dbCustomerData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    const validPassword = await dbCustomerData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    // Once the user successfully logs in, set up the sessions variable 'loggedIn' and allows us access to customer_id of the user
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.customer_id = dbCustomerData.customer_id;
      res
        .status(200)
        .json({ customer: dbCustomerData, message: 'You are now logged in!' });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  // When the user logs out, destroy the session
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;