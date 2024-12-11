// Import statements
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '@/api/apiClient';
import { open } from 'react-native-plaid-link-sdk';
import { createTokenPlaidLink, createLinkOpenProps } from '../../components/plaid/Link';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// Type definitions
interface Account {
  id: string;
  name: string;
  balance: number;
  subtype?: string;
  type: string;
}

interface Institution {
  id: string;
  name: string;
  accountsByType: {
    [type: string]: Account[];
  };
}

interface CreditCard {
  id: string;
  name: string;
  balance: number;
  available: number;
}

type RootStackParamList = {
  AccountDetails: { account: Account };
  CreditCardDetails: { card: CreditCard };
};

// Function to get user ID
const getUserId = async () => {
  const id = await AsyncStorage.getItem('userId');
  console.log('User ID:', id);
  return id;
};

// Fetch transactions from Plaid
const fetchTransactions = async () => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.error('User ID is null or undefined.');
      return;
    }
    await api.post('plaid/transactions', { id: userId });
    console.log('Successfully fetched transactions for userId:', userId);
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

const AccountsPage = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  // Type the navigation prop
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State for institutions containing accounts grouped by type
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  // State for modal visibility and type
  const [modalVisible, setModalVisible] = useState(false);
  const [selectAddTypeModalVisible, setSelectAddTypeModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'CreditCard'>('CreditCard');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // State for new item inputs
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newAvailable, setNewAvailable] = useState('');

  // Net worth calculation
  const [netWorth, setNetWorth] = useState(0);

  // State for expanded institutions and account types
  const [expandedInstitutions, setExpandedInstitutions] = useState<string[]>([]);
  const [expandedAccountTypes, setExpandedAccountTypes] = useState<{ [institutionId: string]: string[] }>({});

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      const userId = await getUserId();
      if (!userId) {
        console.error('User ID is null or undefined.');
        return;
      }
      console.log('User ID:', userId);
      const res = await api.post('user/userinfo', { id: userId });
      console.log('API Response:', res.data);

      // Parse the response and update state
      const items = res.data.items || [];
      let fetchedInstitutions: Institution[] = [];
      let fetchedCreditCards: CreditCard[] = [];

      items.forEach((item: any) => {
        const institutionInfo = item.institution || {};
        const institutionId = institutionInfo.id || '';
        const institutionName = institutionInfo.name || 'Unknown Institution';

        let accountsByType: { [type: string]: Account[] } = {};

        item.accounts.forEach((acc: any) => {
          const balances = acc.balances || [];
          const balanceInfo = balances[0] || {};
          const balance = balanceInfo.current || 0;

          const account: Account = {
            id: acc.id,
            name: acc.name,
            balance: balance,
            subtype: acc.subtype || '',
            type: acc.type || '',
          };

          if (account.type === 'credit') {
            // Handle credit cards separately
            const available = balanceInfo.available || 0;
            const creditCard: CreditCard = {
              id: acc.id,
              name: acc.name,
              balance: balance,
              available: available,
            };
            fetchedCreditCards.push(creditCard);
          } else {
            // Group accounts by type
            if (!accountsByType[account.type]) {
              accountsByType[account.type] = [];
            }
            accountsByType[account.type].push(account);
          }
        });

        const institution: Institution = {
          id: institutionId,
          name: institutionName,
          accountsByType: accountsByType,
        };

        fetchedInstitutions.push(institution);
      });

      setInstitutions(fetchedInstitutions);
      setCreditCards(fetchedCreditCards);

      // Log the updated state
      console.log('Updated Institutions:', fetchedInstitutions);
      console.log('Updated CreditCards:', fetchedCreditCards);

    } catch (error: any) {
      if (error.response) {
        console.error('API Error:', error.response.data);
      } else {
        console.error('Error fetching data', error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch transactions periodically
    fetchTransactions();

    // Set up interval to fetch transactions every 5 minutes
    const interval = setInterval(fetchTransactions, 5 * 60 * 1000); // every 5 minutes

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Calculate net worth whenever data changes
  useEffect(() => {
    calculateNetWorth();
  }, [institutions, creditCards]);

  // Calculate net worth
  const calculateNetWorth = () => {
    const totalAssets = institutions.reduce((sum, inst) => {
      return (
        sum +
        Object.values(inst.accountsByType).reduce(
          (typeSum, accounts) => typeSum + accounts.reduce((accSum, acc) => accSum + acc.balance, 0),
          0
        )
      );
    }, 0);

    const totalLiabilities = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const netWorthValue = totalAssets - totalLiabilities;
    console.log('Calculated Net Worth:', netWorthValue);
    setNetWorth(netWorthValue);
  };

  // Function to add or edit credit cards
  const addOrEditItem = () => {
    if (newName.trim() === '') {
      Alert.alert('Error', 'Please enter all required fields.');
      return;
    }

    if (modalType === 'CreditCard') {
      if (newBalance.trim() === '' || newAvailable.trim() === '') {
        Alert.alert('Error', 'Please enter all required fields.');
        return;
      }
      const card: CreditCard = {
        id: isEditing && editingItemId ? editingItemId : Date.now().toString(),
        name: newName,
        balance: parseFloat(newBalance),
        available: parseFloat(newAvailable),
      };
      if (isEditing) {
        setCreditCards(creditCards.map((c) => (c.id === editingItemId ? card : c)));
      } else {
        setCreditCards([...creditCards, card]);
      }
    }

    // Reset fields and close modal
    resetModal();
  };

  const resetModal = () => { // Reset modal state
    setNewName('');
    setNewBalance('');
    setNewAvailable('');
    setModalVisible(false);
    setIsEditing(false);
    setEditingItemId(null);
  };

  // Function to navigate to details
  const goToDetails = (item: Account | CreditCard, type: 'Account' | 'CreditCard') => {
    if (type === 'Account') {
      navigation.navigate('AccountDetails', { account: item as Account });
    } else if (type === 'CreditCard') {
      navigation.navigate('CreditCardDetails', { card: item as CreditCard });
    }
  };

  // Toggle institution expansion
  const toggleInstitution = (institutionId: string) => {
    setExpandedInstitutions((prev) => {
      if (prev.includes(institutionId)) {
        return prev.filter((id) => id !== institutionId);
      } else {
        return [...prev, institutionId];
      }
    });
  };

  // Toggle account type expansion
  const toggleAccountType = (institutionId: string, accountType: string) => {
    setExpandedAccountTypes((prev) => {
      const institutionTypes = prev[institutionId] || [];
      if (institutionTypes.includes(accountType)) {
        return {
          ...prev,
          [institutionId]: institutionTypes.filter((type) => type !== accountType),
        };
      } else {
        return {
          ...prev,
          [institutionId]: [...institutionTypes, accountType],
        };
      }
    });
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    console.log('Pull-to-refresh initiated');
    setRefreshing(true);

    // Fetch latest transactions and account data from Plaid
    await fetchTransactions();

    // Fetch updated data from your backend and update the state
    await fetchData();

    setRefreshing(false);
    console.log('Refresh complete');
  };

  // Create styles with dynamic colors
  const styles = createStyles(currentColors);

  return ( //Frontend look for the page
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Net Worth Section */}
        <View style={styles.netWorthContainer}>
          <Text style={[styles.netWorthTitle, { color: currentColors.text }]}>Net Worth</Text>
          <Text style={[styles.netWorthValue, { color: currentColors.primary }]}>
            ${netWorth.toFixed(2)}
          </Text>
        </View>

        {/* Add Account Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentColors.primary }]}
          onPress={() => {
            createTokenPlaidLink();
            setSelectAddTypeModalVisible(true);
          }}
        >
          <Text style={[styles.addButtonText, { color: currentColors.background }]}>Add Account</Text>
        </TouchableOpacity>

        {/* Modal for Choosing between Bank or Credit Card */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={selectAddTypeModalVisible}
          onRequestClose={() => {
            setSelectAddTypeModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback onPress={() => setSelectAddTypeModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              Choose Type to Add
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                open(createLinkOpenProps(() => setSelectAddTypeModalVisible(false)));
              }}
            >
              <Icon name="bank" size={24} color={currentColors.icon} />
              <Text style={[styles.modalOptionText, { color: currentColors.text }]}>Add Bank</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setModalType('CreditCard');
                setIsEditing(false);
                setSelectAddTypeModalVisible(false);
                setModalVisible(true);
              }}
            >
              <Icon name="credit-card" size={24} color={currentColors.icon} />
              <Text style={[styles.modalOptionText, { color: currentColors.text }]}>Add Credit Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSelectAddTypeModalVisible(false);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: currentColors.accent }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Accounts Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Institutions</Text>
          {institutions.map((institution) => (
            <View key={institution.id} style={styles.institutionContainer}>
              <TouchableOpacity
                style={styles.institutionHeader}
                onPress={() => toggleInstitution(institution.id)}
              >
                <Text style={[styles.institutionTitle, { color: currentColors.secondary }]}>
                  {institution.name}
                </Text>
              </TouchableOpacity>
              {expandedInstitutions.includes(institution.id) && (
                <View style={styles.institutionContent}>
                  {Object.keys(institution.accountsByType).map((type) => (
                    <View key={type} style={styles.accountTypeContainer}>
                      <TouchableOpacity
                        style={styles.accountTypeHeader}
                        onPress={() => toggleAccountType(institution.id, type)}
                      >
                        <Text style={[styles.accountTypeTitle, { color: currentColors.text }]}>
                          {capitalizeFirstLetter(type)}
                        </Text>
                      </TouchableOpacity>
                      {expandedAccountTypes[institution.id] &&
                        expandedAccountTypes[institution.id].includes(type) && (
                          <View style={styles.accountsList}>
                            {institution.accountsByType[type].map((account) => (
                              <TouchableOpacity
                                key={account.id}
                                style={styles.itemContainer}
                                onPress={() => goToDetails(account, 'Account')}
                              >
                                <View>
                                  <Text style={[styles.itemName, { color: currentColors.text }]}>
                                    {account.name}
                                  </Text>
                                  <Text style={[styles.itemBalance, { color: currentColors.primary }]}>
                                    ${account.balance.toFixed(2)}
                                  </Text>
                                  {account.subtype && (
                                    <Text
                                      style={[styles.itemAvailable, { color: currentColors.secondary }]}
                                    >
                                      {account.subtype}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Credit Cards Section */}
        {creditCards.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Credit Cards</Text>
            {creditCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.itemContainer}
                onPress={() => goToDetails(card, 'CreditCard')}
              >
                <View>
                  <Text style={[styles.itemName, { color: currentColors.text }]}>{card.name}</Text>
                  <Text style={[styles.itemBalance, { color: currentColors.accent }]}>
                    Balance: ${card.balance.toFixed(2)}
                  </Text>
                  <Text style={[styles.itemAvailable, { color: currentColors.secondary }]}>
                    Available Credit: ${card.available.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Modal for Adding Credit Card */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            resetModal();
          }}
        >
          <TouchableWithoutFeedback onPress={resetModal}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              {isEditing ? 'Edit' : 'Add New'} Credit Card
            </Text>
            <TextInput
              style={[
                styles.input,
                { color: currentColors.text, borderColor: currentColors.primary },
              ]}
              placeholder="Name"
              placeholderTextColor={currentColors.icon}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[
                styles.input,
                { color: currentColors.text, borderColor: currentColors.primary },
              ]}
              placeholder="Balance"
              placeholderTextColor={currentColors.icon}
              keyboardType="numeric"
              value={newBalance}
              onChangeText={setNewBalance}
            />
            <TextInput
              style={[
                styles.input,
                { color: currentColors.text, borderColor: currentColors.primary },
              ]}
              placeholder="Available Credit"
              placeholderTextColor={currentColors.icon}
              keyboardType="numeric"
              value={newAvailable}
              onChangeText={setNewAvailable}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                onPress={addOrEditItem}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.background }]}>
                  {isEditing ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.accent }]}
                onPress={resetModal}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.background }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Styles with dynamic colors
const createStyles = (currentColors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: 20,
    },
    netWorthContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    netWorthTitle: {
      fontSize: 24,
      fontWeight: '700',
    },
    netWorthValue: {
      fontSize: 28,
      fontWeight: '800',
      marginTop: 10,
    },
    sectionContainer: {
      marginHorizontal: 20,
      marginVertical: 10,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      marginBottom: 10,
    },
    institutionContainer: {
      marginBottom: 15,
      borderRadius: 8,
      backgroundColor: currentColors.cardBackground,
      overflow: 'hidden',
    },
    institutionHeader: {
      padding: 15,
      backgroundColor: currentColors.cardHeaderBackground,
    },
    institutionTitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    institutionContent: {
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    accountTypeContainer: {
      marginBottom: 10,
    },
    accountTypeHeader: {
      paddingVertical: 10,
    },
    accountTypeTitle: {
      fontSize: 18,
      fontWeight: '500',
    },
    accountsList: {
      paddingLeft: 10,
    },
    itemContainer: {
      paddingVertical: 10,
      borderBottomColor: currentColors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      paddingLeft: 10,
    },
    itemName: {
      fontSize: 16,
    },
    itemBalance: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 5,
    },
    itemAvailable: {
      fontSize: 14,
      color: currentColors.subtext,
      marginTop: 2,
    },
    addButton: {
      marginHorizontal: 20,
      marginTop: 15,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: currentColors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 15,
      textAlign: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
    },
    modalOptionText: {
      fontSize: 18,
      color: currentColors.text,
      marginLeft: 10,
    },
    cancelButton: {
      alignSelf: 'center',
      marginTop: 20,
    },
    cancelButtonText: {
      fontSize: 16,
      color: currentColors.accent,
    },
    input: {
      borderWidth: 1,
      borderRadius: 6,
      padding: 10,
      marginVertical: 8,
      fontSize: 16,
      color: currentColors.text,
      borderColor: currentColors.primary,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default AccountsPage;