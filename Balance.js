const fetchAccountBalances = async (accessToken) => {
    try {
      const response = await fetch('/api/account_balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }), // Send the access token in the request body
      });
  
      if (!response.ok) {
        throw new Error('Error fetching account balances');
      }
  
      const data = await response.json();
      console.log('Account Balances:', data); // Handle the account balances data
    } catch (error) {
      console.error('Error:', error);
    }
  };
  