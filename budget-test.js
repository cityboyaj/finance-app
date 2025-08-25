const axios = require('axios');

async function testBudgeting() {
  try {
    console.log('🧪 Testing Budget System...\n');

    // --- Login to get token ---
    console.log('🔐 Logging in...');
    let res = await axios.post('http://localhost:3000/api/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = res.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Logged in successfully!');

    // --- Get Categories ---
    console.log('\n📋 Getting categories...');
    res = await axios.get('http://localhost:3000/api/categories', { headers });
    const categories = res.data.categories;
    const foodCategory = categories.find(c => c.name === 'Food & Dining');
    const transportCategory = categories.find(c => c.name === 'Transportation');
    console.log(`✅ Found ${categories.length} categories`);

    // --- Set Budgets ---
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    console.log(`\n💰 Setting budgets for ${month}/${year}...`);
    
    // Set Food budget: $400
    res = await axios.post('http://localhost:3000/api/budgets', {
      CategoryId: foodCategory.id,
      budgetAmount: 400,
      month: month,
      year: year
    }, { headers });
    console.log('✅ Food budget set:', res.data.message);

    // Set Transportation budget: $200  
    res = await axios.post('http://localhost:3000/api/budgets', {
      CategoryId: transportCategory.id,
      budgetAmount: 200,
      month: month,
      year: year
    }, { headers });
    console.log('✅ Transportation budget set:', res.data.message);

    // --- Add Some Transactions ---
    console.log('\n🛒 Adding test transactions...');
    
    // Add food expense: $45
    await axios.post('http://localhost:3000/api/transactions', {
      amount: 45,
      description: 'Grocery shopping',
      type: 'expense',
      CategoryId: foodCategory.id
    }, { headers });
    console.log('✅ Added grocery expense: $45');

    // Add transportation expense: $25
    await axios.post('http://localhost:3000/api/transactions', {
      amount: 25,
      description: 'Gas',
      type: 'expense',
      CategoryId: transportCategory.id
    }, { headers });
    console.log('✅ Added gas expense: $25');

    // Add another food expense: $30
    await axios.post('http://localhost:3000/api/transactions', {
      amount: 30,
      description: 'Restaurant dinner',
      type: 'expense',
      CategoryId: foodCategory.id
    }, { headers });
    console.log('✅ Added restaurant expense: $30');

    // --- Get Budget Overview ---
    console.log('\n📊 Getting budget overview...');
    res = await axios.get(`http://localhost:3000/api/budgets/overview?month=${month}&year=${year}`, { headers });
    const overview = res.data.overview;
    
    console.log('📈 BUDGET OVERVIEW:');
    console.log(`   Total Budget: $${overview.totalBudget}`);
    console.log(`   Total Spent: $${overview.totalSpent}`);
    console.log(`   Remaining: $${overview.remainingBudget}`);
    console.log(`   Budget Used: ${overview.budgetUsedPercentage}%`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    res.data.budgets.forEach(budget => {
      console.log(`   ${budget.Category.name}:`);
      console.log(`     Budget: $${budget.budgetAmount}`);
      console.log(`     Spent: $${budget.spentAmount}`);
      console.log(`     Remaining: $${budget.remainingAmount}`);
      console.log(`     Status: ${budget.status} (${budget.percentageUsed}% used)`);
    });

    // --- Get All Budgets ---
    console.log('\n📝 Getting all budgets...');
    res = await axios.get(`http://localhost:3000/api/budgets?month=${month}&year=${year}`, { headers });
    console.log(`✅ Retrieved ${res.data.budgets.length} budgets for ${month}/${year}`);

    console.log('\n🎉 All budget tests completed successfully!');

  } catch (err) {
    console.error('❌ Test Error:', err.response?.data || err.message);
  }
}

testBudgeting();