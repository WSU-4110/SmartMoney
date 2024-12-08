import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LineChart } from 'react-native-gifted-charts';
import api from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

interface Account {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}

interface Institution {
  id: string;
  name: string;
  accounts: Account[];
}

const DetailedAccountPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccountDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Fetch account and transaction data from your existing endpoints
      const institutionResponse = await api.post('user/userinfo', { id: userId });
      const transactionResponse = await api.post('user/transactions', { id: userId });

      const institutionsData = institutionResponse.data.items || [];
      const transactionsData = transactionResponse.data.transactions || [];

      const institutions = institutionsData.map((institution: any) => {
        const institutionAccounts = institution.accounts.map((account: any) => {
          const accountTransactions = transactionsData
            .filter((tran: any) => tran.accountId === account.id)
            .map((tran: any) => ({
              id: tran.accountId,
              date: tran.date,
              description: tran.merchant || 'Unknown Merchant',
              amount: Math.abs(tran.amount),
              type: tran.amount < 0 ? 'credit' : 'debit',
            }));
          return {
            id: account.id,
            name: account.name,
            balance: account.balances[0]?.current || 0,
            transactions: accountTransactions,
          };
        });

        return {
          id: institution.institution.id,
          name: institution.institution.name,
          accounts: institutionAccounts,
        };
      });

      setInstitutions(institutions);

      if (institutions.length > 0) {
        setSelectedInstitution(institutions[0]);
        if (institutions[0].accounts.length > 0) {
          setSelectedAccount(institutions[0].accounts[0]);
        } else {
          setSelectedAccount(null);
        }
      } else {
        setSelectedInstitution(null);
        setSelectedAccount(null);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccountDetails();
    setRefreshing(false);
  };

  const generateChartData = (transactions: Transaction[], initialBalance: number) => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulativeBalance = initialBalance;

    const chartData = sortedTransactions.map((tran) => {
      cumulativeBalance += tran.type === 'credit' ? tran.amount : -tran.amount;
      return {
        value: cumulativeBalance,
        label: tran.date.slice(0, 10),
      };
    });

    return [{ value: initialBalance, label: 'Start' }, ...chartData];
  };

  const styles = createStyles(currentColors);

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={selectedAccount?.transactions || []}
          keyExtractor={(item, index) => `${selectedAccount?.id || 'no-account'}-${item.id}-${index}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={() => (
            <View>
              {/* Institution Selector */}
              <View style={styles.institutionSelectorContainer}>
                <FlatList
                  data={institutions}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = item.id === selectedInstitution?.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.institutionButton,
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
                        onPress={() => {
                          setSelectedInstitution(item);
                          if (item.accounts.length > 0) {
                            setSelectedAccount(item.accounts[0]);
                          } else {
                            setSelectedAccount(null);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.institutionButtonText,
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

              {/* Account Selector */}
              <View style={styles.accountSelectorContainer}>
                <FlatList
                  data={selectedInstitution?.accounts || []}
                  horizontal
                  keyExtractor={(item) =>
                    `${selectedInstitution?.id}-${item.id}`
                  }
                  renderItem={({ item }) => {
                    const isSelected = item.id === selectedAccount?.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.accountButton,
                          {
                            backgroundColor: isSelected
                              ? currentColors.primary
                              : currentColors.background,
                            borderColor: isSelected
                              ? currentColors.primary
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

              {/* Balance and Chart */}
              {selectedAccount && (
                <>
                  <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceLabel, { color: currentColors.text }]}>
                      Balance
                    </Text>
                    <Text style={[styles.balanceAmount, { color: currentColors.text }]}>
                      ${selectedAccount.balance.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.chartContainer}>
                    <LineChart
                      data={generateChartData(
                        selectedAccount.transactions,
                        selectedAccount.balance
                      )}
                      width={width - 40}
                      height={200}
                      color={currentColors.accent}
                      yAxisColor={currentColors.text}
                      xAxisColor={currentColors.text}
                      textColor={currentColors.text}
                      dataPointsColor={currentColors.accent}
                      dataPointsRadius={4}
                      yAxisTextStyle={{ color: currentColors.text }}
                      backgroundColor={currentColors.background}
                      noOfSections={4}
                      yAxisLabelPrefix="$"
                    />
                  </View>
                </>
              )}

              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
                Transactions
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View>
                <Text
                  style={[styles.transactionDescription, { color: currentColors.text }]}
                >
                  {item.description}
                </Text>
                <Text
                  style={[styles.transactionDate, { color: currentColors.secondary }]}
                >
                  {item.date.slice(0, 10)}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      item.type === 'credit'
                        ? currentColors.accent
                        : currentColors.primary,
                  },
                ]}
              >
                {item.type === 'credit' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholderText, { color: currentColors.icon }]}>
                No account data available. Please add an account to get started.
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

const createStyles = (currentColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      margin: 20,
      borderRadius: 10,
    },
    institutionSelectorContainer: {
      marginBottom: 10,
    },
    institutionButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginRight: 10,
    },
    institutionButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    accountSelectorContainer: {
      marginBottom: 20,
    },
    accountButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginRight: 10,
    },
    accountButtonText: {
      fontSize: 14,
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
      paddingBottom: 10,
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
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    placeholderText: {
      fontSize: 18,
      textAlign: 'center',
      marginHorizontal: 20,
    },
  });

export default DetailedAccountPage;