// Test Better Auth sign-up directly with enhanced error reporting
const testSignUp = async () => {
  const testEmail = `test-${Date.now()}@example.com`;
  console.log('🧪 Testing signup with email:', testEmail);
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000', // Required by Better Auth for CSRF protection
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePassword123!',
        name: 'Test User'
      })
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('');

    // Get response headers
    console.log('📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('');

    // Get response body
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📦 Response Body:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('📦 Response Body (text):');
      console.log(text);
    }

    console.log('');

    if (response.ok) {
      console.log('✅ Signup test PASSED!');
      console.log('');
      console.log('User created successfully with email:', testEmail);
      return true;
    } else {
      console.log('❌ Signup test FAILED!');
      console.log('');
      console.log('Error Details:');
      console.log('- Status:', response.status);
      console.log('- Message:', data?.message || 'Unknown error');
      console.log('- Code:', data?.code || 'Unknown code');
      return false;
    }
  } catch (error) {
    console.log('❌ Test Error:', error.message);
    console.log('');
    console.log('Error Details:');
    console.error(error);
    return false;
  }
};

// Run the test
console.log('🚀 Starting Better Auth Signup Test');
console.log('=====================================');
console.log('');

testSignUp().then(success => {
  console.log('');
  console.log('=====================================');
  console.log(success ? '✅ Test completed successfully' : '❌ Test failed');
  process.exit(success ? 0 : 1);
});
