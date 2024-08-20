const signupFormHandler = async (event) => {
  event.preventDefault();

  const firstName = document.querySelector('.first-name-signup').value.trim();
  const lastName = document.querySelector('.last-name-signup').value.trim();
  const email = document.querySelector('.email-signup').value.trim();
  const password = document.querySelector('.password-signup').value.trim();
  console.log(firstName, lastName, email, password);

  if (firstName && lastName && email && password) {
    const response = await fetch('/api/customer', {
      method: 'POST',
      body: JSON.stringify({ 
        first_name: firstName, 
        last_name: lastName, 
        email_address: email, 
        password: password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      document.location.replace('/login');
    } else {
      alert('Failed to sign up.');
    }
  }
};

document
  .querySelector('.signup-form')
  .addEventListener('click', signupFormHandler);