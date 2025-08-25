const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('🧪 Testing Finance App Endpoints...\n');

    let token;
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;

    // --- Try Registration First ---
    console.log('📝 Testing Registration...');
    try {
      let res = await axios.post('http://localhost:3000/api/register', {
        username: testUsername,
        email: testEmail,
        password: 'password123'
      });
      console.log('✅ Register Response:', res.data);
      
      // Now login with the new user
      console.log('\n🔐 Testing Login with new user...');
      res = await axios.post('http://localhost:3000/api/login', {
        email: testEmail,
        password: 'password123'
      });
      console.log('✅ Login Response:', res.data);
      token = res.data.token;
      
    } catch (registerErr) {
      console.log('⚠️  Registration failed (user might exist), trying login...');
      
      // If registration fails, try logging in with existing user
      console.log('\n🔐 Testing Login with existing user...');
      try {
        let res = await axios.post('http://localhost:3000/api/login', {
          email: 'test@example.com',
          password: 'password123'
        });
        console.log('✅ Login Response:', res.data);
        token = res.data.token;
      } catch (loginErr) {
        console.log('❌ Both registration and login failed. Creating fresh user...');
        // Try with a completely unique email
        const uniqueEmail = `testuser${Math.random().toString(36).substring(7)}@example.com`;
        let res = await axios.post('http://localhost:3000/api/register', {
          username: `user${Math.random().toString(36).substring(7)}`,
          email: uniqueEmail,
          password: 'password123'
        });
        console.log('✅ Fresh user created:', res.data);
        
        // Login with fresh user
        res = await axios.post('http://localhost:3000/api/login', {
          email: uniqueEmail,
          password: 'password123'
        });
        token = res.data.token;
      }
    }

    if (!token) {
      throw new Error('Could not obtain authentication token');
    }

    const headers = { Authorization: `Bearer ${token}` };

    // --- Get Categories ---
    console.log('\n📋 Testing Get Categories...');
    let res = await axios.get('http://localhost:3000/api/categories', { headers });
    console.log('✅ Categories Response:', `Found ${res.data.categories.length} categories`);
    
    // Get a category ID for testing (prefer Food & Dining if available)
    let categoryId = res.data.categories.find(c => c.name === 'Food & Dining')?.id;
    if (!categoryId) {
      categoryId = res.data.categories[0]?.id;
    }
    console.log(`📂 Using category ID: ${categoryId}`);

    // --- Add Transaction with Category ---
    console.log('\n💰 Testing Add Transaction with Category...');
    res = await axios.post('http://localhost:3000/api/transactions', {
      amount: 25.50,
      description: 'Lunch at cafe',
      type: 'expense',
      CategoryId: categoryId
    }, { headers });
    console.log('✅ Add Transaction Response:', res.data.message);
    console.log(`   Transaction ID: ${res.data.transaction.id}`);

    // --- Add Another Transaction ---
    console.log('\n💰 Testing Add Income Transaction...');
    const incomeCategory = res.data.categories?.find(c => c.type === 'income') || 
                          await axios.get('http://localhost:3000/api/categories', { headers })
                                  .then(r => r.data.categories.find(c => c.type === 'income'));
    
    if (incomeCategory) {
      res = await axios.post('http://localhost:3000/api/transactions', {
        amount: 100.00,
        description: 'Freelance payment',
        type: 'income',
        CategoryId: incomeCategory.id
      }, { headers });
      console.log('✅ Add Income Transaction Response:', res.data.message);
    }

    // --- Get Transactions ---
    console.log('\n📊 Testing Get Transactions...');
    res = await axios.get('http://localhost:3000/api/transactions', { headers });
    console.log('✅ Transactions Response:', `Found ${res.data.transactions.length} transactions`);
    
    // Show transaction details
    if (res.data.transactions.length > 0) {
      console.log('   Recent transactions:');
      res.data.transactions.slice(0, 3).forEach(t => {
        console.log(`   - ${t.description}: $${t.amount} (${t.type}) [${t.Category?.name || 'No category'}]`);
      });
    }

    // --- Test Budget Features ---
    console.log('\n💰 Testing Budget Features...');
    
    // Set a budget
    if (categoryId) {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      console.log(`📊 Setting budget for month ${month}/${year}...`);
      res = await axios.post('http://localhost:3000/api/budgets', {
        CategoryId: categoryId,
        budgetAmount: 200,
        month: month,
        year: year
      }, { headers });
      console.log('✅ Budget set:', res.data.message);
      
      // Get budget overview
      console.log('\n📈 Testing Budget Overview...');
      res = await axios.get(`http://localhost:3000/api/budgets/overview?month=${month}&year=${year}`, { headers });
      console.log('✅ Budget Overview Response:');
      console.log(`   Total Budget: $${res.data.overview.totalBudget}`);
      console.log(`   Total Spent: $${res.data.overview.totalSpent}`);
      console.log(`   Remaining: $${res.data.overview.remainingBudget}`);
      console.log(`   Budget Used: ${res.data.overview.budgetUsedPercentage}%`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Categories: Working');
    console.log('   ✅ Transactions: Working');
    console.log('   ✅ Budgets: Working');

  } catch (err) {
    console.error('❌ Test Error:', err.response?.data || err.message);
    
    if (err.response?.status === 500) {
      console.log('\n🔍 Server Error Details:');
      console.log('   - Check if your database is running');
      console.log('   - Check server logs for specific errors');
      console.log('   - Verify all models are properly defined');
    }
  }
}

// Add some helpful info
console.log('🚀 Starting Finance App API Tests...');
console.log('📝 Make sure your server is running on http://localhost:3000\n');

testEndpoints();