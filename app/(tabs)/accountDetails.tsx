import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

interface Account {
  id: number;
  name: string;
  balance: number;
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

const DetailedAccountPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // You need to provide the accessToken

  // Define the APIAccount interface for the API response
  interface APIAccount {
    account_id: number;
    name: string;
    balances: {
      current: number;
    };
  }

  // Function to fetch account balances
  const fetchAccountBalances = async (accessToken: string) => {
    try {
      const response = await fetch('http://10.0.0.117:3000/api/account_balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
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

  // Fetch real accounts using the API
  const fetchAccounts = async () => {
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }

    try {
      const fetchedAccounts = await fetchAccountBalances(accessToken);
      if (fetchedAccounts) {
        const accountData = fetchedAccounts.map((account: APIAccount) => ({
          id: account.account_id,
          name: account.name,
          balance: account.balances.current,
          transactions: [], // Fetch transactions separately if needed
        }));
        setAccounts(accountData);
        setSelectedAccount(accountData[0]); // Set the first account as selected by default
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchAccounts(); // Fetch real accounts when the accessToken is available
    }
  }, [accessToken]);

  // Set the accessToken once Plaid or another authentication system provides it
  useEffect(() => {
    // This is where you should set the access token, possibly after a Plaid login or similar process
    setAccessToken(accessToken); // Replace this with the actual logic to obtain the accessToken
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <SafeAreaView style={[styles.container]}>
        {selectedAccount && (
          <FlatList
            data={selectedAccount.transactions}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={() => (
              <View>
                <View style={styles.accountSelectorContainer}>
                  <FlatList
                    data={accounts}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                      const isSelected = item.id === selectedAccount.id;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.accountButton,
                            {
                              backgroundColor: isSelected
                                ? currentColors.accent
                                : currentColors.background,
                              borderColor: isSelected
                                ? currentColors.accent
                                : currentColors.text,
                              borderWidth: 1,
                            },
                          ]}
                          onPress={() => setSelectedAccount(item)}
                        >
                          <Text
                            style={[
                              styles.accountButtonText,
                              {
                                color: isSelected
                                  ? currentColors.background
                                  : currentColors.text,
                              },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>

                <View style={styles.balanceContainer}>
                  <Text style={[styles.balanceLabel, { color: currentColors.text }]}>Balance</Text>
                  <Text style={[styles.balanceAmount, { color: currentColors.text }]}>
                    ${selectedAccount.balance.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.chartContainer}>
                  <LineChart
                    data={[{ value: 2500 }, { value: 2550 }, { value: 2450 }]}
                    width={width - 40}
                    color={currentColors.accent}
                    yAxisColor={currentColors.text}
                    xAxisColor={currentColors.text} 
                    textColor={currentColors.text} 
                    dataPointsColor={currentColors.accent} 
                    dataPointsRadius={4} 
                    yAxisTextStyle={{ color: currentColors.text }}
                    backgroundColor={currentColors.background}
                  />
                </View>

                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                  Transactions
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View>
                  <Text style={[styles.transactionDescription, { color: currentColors.text }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.transactionDate, { color: currentColors.text }]}>
                    {item.date}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: item.type === 'credit'
                        ? currentColors.accent
                        : currentColors.primary,
                    },
                  ]}
                >
                  {item.type === 'credit' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={[styles.noTransactionsText, { color: currentColors.icon }]}>
                No transactions available.
              </Text>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    borderRadius: 10,
  },
  accountSelectorContainer: {
    marginBottom: 20,
  },
  accountButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  chartContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transactionDescription: {
    fontSize: 16,
  },
  transactionDate: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  noTransactionsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DetailedAccountPage;
