const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('🧪 Testing Finance App Endpoints...\n');

    // --- Register ---
    console.log('📝 Testing Registration...');
    let res = await axios.post('http://localhost:3000/api/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Register Response:', res.data);

    // --- Login ---
    console.log('\n🔐 Testing Login...');
    res = await axios.post('http://localhost:3000/api/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login Response:', res.data);
    
    const token = res.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // --- Get Categories ---
    console.log('\n📋 Testing Get Categories...');
    res = await axios.get('http://localhost:3000/api/categories', { headers });
    console.log('✅ Categories Response:', res.data);
    
    // Get a category ID for testing
    const categoryId = res.data.categories[0]?.id;

    // --- Add Transaction with Category ---
    console.log('\n💰 Testing Add Transaction with Category...');
    res = await axios.post('http://localhost:3000/api/transactions', {
      amount: 25.50,
      description: 'Lunch at cafe',
      type: 'expense',
      CategoryId: categoryId
    }, { headers });
    console.log('✅ Add Transaction Response:', res.data);

    // --- Get Transactions ---
    console.log('\n📊 Testing Get Transactions...');
    res = await axios.get('http://localhost:3000/api/transactions', { headers });
    console.log('✅ Transactions Response:', res.data);

    console.log('\n🎉 All tests completed successfully!');

  } catch (err) {
    console.error('❌ Test Error:', err.response?.data || err.message);
  }
}

testEndpoints();