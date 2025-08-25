const axios = require('axios');

async function testEndpoints() {
  try {
    // --- Register ---
    let res = await axios.post('http://localhost:3000/api/register', {
      username: 'ajay',
      email: 'ajay@example.com',
      password: 'Ajay2008'
    });
    console.log('Register Response:', res.data);

    // --- Login ---
    res = await axios.post('http://localhost:3000/api/login', {
      email: 'ajay@example.com',
      password: 'Ajay2008'
    });
    console.log('Login Response:', res.data);

    const userId = 1; // use the ID from register

    // --- Add Transaction ---
    res = await axios.post('http://localhost:3000/api/transactions', {
      userId: userId,
      amount: 50.75,
      description: 'Groceries',
      type: 'expense'
    });
    console.log('Add Transaction Response:', res.data);

    // --- List Transactions ---
    res = await axios.get(`http://localhost:3000/api/transactions/${userId}`);
    console.log('List Transactions Response:', res.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

testEndpoints();
