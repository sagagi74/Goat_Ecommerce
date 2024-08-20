document
    .querySelector('#backToProduct')
    .addEventListener("click", function(event) {
        event.preventDefault();
        document.location.replace('/products');
    });


document.querySelector('#transaction').addEventListener("click", async function() {
    try {
        await fetch('/api/transaction/complete', {
            method: 'PUT',
        });
        document.location.replace(`/transactionComplete/${$(this).data("id")}`);
    } catch (err) {
        console.log('Error on POST');
    }
});