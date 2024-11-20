import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  TextInput,
  Button,
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

export class AccountRepository {
  private static instance: AccountRepository;
  private accounts: Account[] = [];

  public static getAccountRespository(): AccountRepository {
    if (!AccountRepository.instance) {
      AccountRepository.instance = new AccountRepository();
    }
    return AccountRepository.instance;
  }

  public async fetchAccounts(): Promise<Account[]> {
    if (this.accounts.length == 0) {
      this.accounts = [
        {
          id: 1,
          name: 'Checking Account',
          balance: 2500,
          transactions: [
            { id: 1, date: '10-01-2023', description: 'Grocery Store', amount: -50, type: 'debit' },
            { id: 2, date: '10-02-2023', description: 'Salary', amount: 5000, type: 'credit' },
            { id: 3, date: '10-03-2023', description: 'Electricity Bill', amount: -100, type: 'debit' },
          ],
        },
        {
          id: 2,
          name: 'Savings Account',
          balance: 10000,
          transactions: [
            { id: 4, date: '9-15-2023', description: 'Interest', amount: 50, type: 'credit' },
          ],
        },
      ];
    }
    return this.accounts;
  }
  

  

  public getAccountById(id: number): Account | null {
    return this.accounts.find(account => account.id === id) || null;
  }
}

const DetailedAccountPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: Date.now(),
    date: '',
    description: '',
    amount: 0,
    type: 'debit',
  });
  
  const addTransaction = () => {
    if (selectedAccount) {
      const updatedTransactions = [
        ...selectedAccount.transactions,
        { ...newTransaction, id: Date.now() },
      ];
      const updatedAccount = { ...selectedAccount, transactions: updatedTransactions };
      setSelectedAccount(updatedAccount);

      // Clear the form and close the modal
      setNewTransaction({ id: Date.now(), date: '', description: '', amount: 0, type: 'debit' });
      setModalVisible(false);
    }
  };
  
  
  useEffect(() => {
    const fetchData = async () => {
      const repository = AccountRepository.getAccountRespository();
      const accountData = await repository.fetchAccounts();
      setAccounts(accountData);
      setSelectedAccount(accountData[0]);
    };

    

    fetchData();

    
  }, []);

  

  return (
    <View style={{ flex: 1, backgroundColor: currentColors.background }}>
      <SafeAreaView style={styles.container}>
        {selectedAccount && (
          <>
            {/* Button to open the modal */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: 'white' }}>Add Transaction</Text>
            </TouchableOpacity>

            {/* Transaction Modal */}
            <Modal visible={modalVisible} animationType="slide">
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add Transaction</Text>
                <TextInput
                  placeholder="Description"
                  style={styles.input}
                  value={newTransaction.description}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
                />
                <TextInput
                  placeholder="Date (e.g., 10-01-2023)"
                  style={styles.input}
                  value={newTransaction.date}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, date: text })}
                />
                <TextInput
                  placeholder="Amount"
                  style={styles.input}
                  keyboardType="numeric"
                  value={newTransaction.amount.toString()}
                  onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: parseFloat(text) })}
                />
                <TouchableOpacity
                  style={styles.typeButton}
                  onPress={() =>
                    setNewTransaction({
                      ...newTransaction,
                      type: newTransaction.type === 'debit' ? 'credit' : 'debit',
                    })
                  }
                >
                  <Text>Type: {newTransaction.type}</Text>
                </TouchableOpacity>
                <Button title="Add Transaction" onPress={addTransaction} />
                <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
              </View>
            </Modal>

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
          </>
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
  // under here is added code below
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  typeButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    borderRadius: 5,
  },
  // added code above
});

export default DetailedAccountPage;