const buyProductQuantity = async (event) => {
    let numOfAlerts = '';
    event.preventDefault();

    // gets the quantity entered by the user
    const productQuantity = document.querySelector('#product-quantity').value;

    // getting the product_id
    const pageURL = new URL(window.location.href);
    const urlArr = pageURL.pathname.split('/');
    const product_id = urlArr[urlArr.length - 1];

    const total = 0; // has to be declared because part of table
    // this is getting the customer_id
    const customer_id = parseInt(document.querySelector('#customerID').textContent);  // Assuming you have the customer ID available here
    const created_date = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const ordered = 0; // has to be declared because part of table
    const transaction_id = 0; // has to be declared because part of table
    const dordered = 0; // has to be declared because part of table
    const transactionData = {
        total,
        customer_id,
        created_date,
        ordered,
        transaction_id,
        product_id,
        dordered,
    };
    if (productQuantity >= 1) {
        for (let i=0; i < productQuantity; i++) {
        try {
                const response = await fetch(`/api/products/${product_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transactionData)
                });
                const result = await response.json();
                if (result.success) {
                    if (numOfAlerts  === '') {
                        numOfAlerts = 'Product has been added to your shopping cart.';
                        alert(numOfAlerts);
                    } else {
                    }
                } else {
                    console.error('Error inserting data:', result.error);
                }
            } catch (err) {
                console.error('Error inserting ');
            }
        };
    } else {
        alert("Please enter a valid quantity. \nCannot add quantity of 0.")
    };
};
document
    .querySelector('.product-bought')
    .addEventListener('submit', buyProductQuantity);
