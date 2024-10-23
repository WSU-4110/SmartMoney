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
import { useTheme } from '../themeContext';

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
  const { theme, toggleTheme } = useTheme(); 
  const currentColors = Colors[theme.dark ? 'dark' : 'light'];

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accountData: Account[] = [
        {
          id: 1,
          name: 'Checking Account',
          balance: 2500,
          transactions: [
            { id: 1, date: '2023-10-01', description: 'Grocery Store', amount: -50, type: 'debit' },
            { id: 2, date: '2023-10-02', description: 'Salary', amount: 3000, type: 'credit' },
            { id: 3, date: '2023-10-03', description: 'Electricity Bill', amount: -100, type: 'debit' },
          ],
        },
        {
          id: 2,
          name: 'Savings Account',
          balance: 10000,
          transactions: [
            { id: 4, date: '2023-09-15', description: 'Interest', amount: 50, type: 'credit' },
          ],
        },
      ];

      setAccounts(accountData);
      setSelectedAccount(accountData[0]);
    };

    fetchAccounts();
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
                    data={[
                      { value: 2500 },
                      { value: 2550 },
                      { value: 2450 },
                    ]}
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