const fetchAccountBalances = async (accessToken: string) => {
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
    return data.accounts; // Assuming the response contains an 'accounts' array
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};