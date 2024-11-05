//import statements
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
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/apiClient';
import { open } from 'react-native-plaid-link-sdk';
import { createTokenPlaidLink, createLinkOpenProps } from '../plaid/Link';

//type definitions
interface Account {
  id: number;
  name: string;
  balance: number;
}

interface CreditCard {
  id: number;
  name: string;
  balance: number;
  available: number;
}

interface Asset {
  id: number;
  name: string;
  value: number;
  type: string;
}

//define types for navigation parameters
type RootStackParamList = {
  AccountDetails: { account: Account };
  CreditCardDetails: { card: CreditCard };
  
  //to-do: add assets route
};

const AccountsPage = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  //type the navigation prop
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  //state for accounts, credit cards, and assets
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  //state for modal visibility and type
  const [modalVisible, setModalVisible] = useState(false);
  const [selectAddTypeModalVisible, setSelectAddTypeModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'Account' | 'CreditCard' | 'Asset'>('Account');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  //state for new item inputs
  const [newName, setNewName] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const [newAvailable, setNewAvailable] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('');

  //net worth calculation
  const [netWorth, setNetWorth] = useState(0);

  //load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  //calculate net worth whenever data changes
  useEffect(() => {
    calculateNetWorth();
    saveData();
  }, [accounts, creditCards, assets]);

  // Functions to load and save data
  const loadData = async () => {
    try {
      const accountsData = await AsyncStorage.getItem('accounts');
      const creditCardsData = await AsyncStorage.getItem('creditCards');
      const assetsData = await AsyncStorage.getItem('assets');

      if (accountsData) setAccounts(JSON.parse(accountsData));
      if (creditCardsData) setCreditCards(JSON.parse(creditCardsData));
      if (assetsData) setAssets(JSON.parse(assetsData));
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
      await AsyncStorage.setItem('creditCards', JSON.stringify(creditCards));
      await AsyncStorage.setItem('assets', JSON.stringify(assets));
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  //calculate net worth
  const calculateNetWorth = () => {
    const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0) + assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = creditCards.reduce((sum, card) => sum + card.balance, 0);
    setNetWorth(totalAssets - totalLiabilities);
  };

  //function to add or edit items
  const addOrEditItem = () => {
    if (newName.trim() === '') {
      Alert.alert('Error', 'Please enter all required fields.');
      return;
    }

    if (modalType === 'Account') {
      if (newBalance.trim() === '') {
        Alert.alert('Error', 'Please enter all required fields.');
        return;
      }
      const account: Account = {
        id: isEditing && editingItemId ? editingItemId : Date.now(),
        name: newName,
        balance: parseFloat(newBalance),
      };
      if (isEditing) {
        setAccounts(accounts.map((acc) => (acc.id === editingItemId ? account : acc)));
      } else {
        setAccounts([...accounts, account]);
      }
    } else if (modalType === 'CreditCard') {
      if (newBalance.trim() === '' || newAvailable.trim() === '') {
        Alert.alert('Error', 'Please enter all required fields.');
        return;
      }
      const card: CreditCard = {
        id: isEditing && editingItemId ? editingItemId : Date.now(),
        name: newName,
        balance: parseFloat(newBalance),
        available: parseFloat(newAvailable),
      };
      if (isEditing) {
        setCreditCards(creditCards.map((c) => (c.id === editingItemId ? card : c)));
      } else {
        setCreditCards([...creditCards, card]);
      }
    } else if (modalType === 'Asset') {
      if (newValue.trim() === '' || newType.trim() === '') {
        Alert.alert('Error', 'Please enter all required fields.');
        return;
      }
      const asset: Asset = {
        id: isEditing && editingItemId ? editingItemId : Date.now(),
        name: newName,
        value: parseFloat(newValue),
        type: newType,
      };
      if (isEditing) {
        setAssets(assets.map((a) => (a.id === editingItemId ? asset : a)));
      } else {
        setAssets([...assets, asset]);
      }
    }

    //reset fields and close modal
    resetModal();
  };

  const resetModal = () => {
    setNewName('');
    setNewBalance('');
    setNewAvailable('');
    setNewValue('');
    setNewType('');
    setModalVisible(false);
    setIsEditing(false);
    setEditingItemId(null);
  };

  //function to remove an item
  const removeItem = (id: number, type: 'Account' | 'CreditCard' | 'Asset') => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (type === 'Account') {
              setAccounts(accounts.filter((account) => account.id !== id));
            } else if (type === 'CreditCard') {
              setCreditCards(creditCards.filter((card) => card.id !== id));
            } else if (type === 'Asset') {
              setAssets(assets.filter((asset) => asset.id !== id));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  //function to edit an item
  const editItem = (id: number, type: 'Account' | 'CreditCard' | 'Asset') => {
    setModalType(type);
    setIsEditing(true);
    setEditingItemId(id);
    setModalVisible(true);

    if (type === 'Account') {
      const account = accounts.find((acc) => acc.id === id);
      if (account) {
        setNewName(account.name);
        setNewBalance(account.balance.toString());
      }
    } else if (type === 'CreditCard') {
      const card = creditCards.find((c) => c.id === id);
      if (card) {
        setNewName(card.name);
        setNewBalance(card.balance.toString());
        setNewAvailable(card.available.toString());
      }
    } else if (type === 'Asset') {
      const asset = assets.find((a) => a.id === id);
      if (asset) {
        setNewName(asset.name);
        setNewValue(asset.value.toString());
        setNewType(asset.type);
      }
    }
  };

  //function to navigate to details (wip)
  const goToDetails = (item: Account | CreditCard | Asset, type: 'Account' | 'CreditCard' | 'Asset') => {
    if (type === 'Account') {
      navigation.navigate('AccountDetails', { account: item as Account });
    } else if (type === 'CreditCard') {
      navigation.navigate('CreditCardDetails', { card: item as CreditCard }); //to-do make CCdetails page
    }
    //to-do: implement AssetDetails here
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Net Worth Section */}
        <View style={styles.netWorthContainer}>
          <Text style={[styles.netWorthTitle, { color: currentColors.text }]}>Net Worth</Text>
          <Text style={[styles.netWorthValue, { color: currentColors.primary }]}>${netWorth.toFixed(2)}</Text>
        </View>

        {/* Accounts Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Accounts</Text>
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={styles.itemContainer}
              onPress={() => goToDetails(account, 'Account')}
            >
              <View>
                <Text style={[styles.itemName, { color: currentColors.text }]}>{account.name}</Text>
                <Text style={[styles.itemBalance, { color: currentColors.primary }]}>
                  ${account.balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => editItem(account.id, 'Account')}>
                  <FontAwesome name="edit" size={24} color={currentColors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(account.id, 'Account')}>
                  <FontAwesome name="trash-o" size={24} color={currentColors.accent} style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentColors.primary }]}
            onPress={() => {
              createTokenPlaidLink();
              setSelectAddTypeModalVisible(true);
            }}
          >
            <Text style={[styles.addButtonText, { color: currentColors.background }]}>Add Account</Text>
          </TouchableOpacity>
        </View>

        {/* New Modal for Choosing between Bank or Credit Card */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectAddTypeModalVisible}
          onRequestClose={() => {
            setSelectAddTypeModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Choose Type to Add</Text>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                onPress={() => {
                  open(createLinkOpenProps());
                  //setModalType('Account');
                  //setIsEditing(false);
                  //setSelectAddTypeModalVisible(false);
                  //setModalVisible(true);
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.background }]}>Add Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                onPress={() => {
                  setModalType('CreditCard');
                  setIsEditing(false);
                  setSelectAddTypeModalVisible(false);
                  setModalVisible(true);
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.background }]}>Add Credit Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.accent }]}
                onPress={() => {
                  setSelectAddTypeModalVisible(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.background }]}>Cancel</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>

        {/* Credit Cards Section */}
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
                  Used of: ${card.available.toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => editItem(card.id, 'CreditCard')}>
                  <FontAwesome name="edit" size={24} color={currentColors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(card.id, 'CreditCard')}>
                  <FontAwesome name="trash-o" size={24} color={currentColors.accent} style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentColors.primary }]}
            onPress={() => {
              
            }}
          >
            <Text style={[styles.addButtonText, { color: currentColors.background }]}>Add Credit Card</Text>
          </TouchableOpacity>
        </View>

        {/* Assets Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Assets</Text>
          {assets.map((asset) => (
            <TouchableOpacity
              key={asset.id}
              style={styles.itemContainer}
              onPress={() => goToDetails(asset, 'Asset')}
            >
              <View>
                <Text style={[styles.itemName, { color: currentColors.text }]}>{asset.name}</Text>
                <Text style={[styles.itemBalance, { color: currentColors.primary }]}>
                  ${asset.value.toFixed(2)}
                </Text>
                <Text style={[styles.itemAvailable, { color: currentColors.secondary }]}>
                  Type: {asset.type}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => editItem(asset.id, 'Asset')}>
                  <FontAwesome name="edit" size={24} color={currentColors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(asset.id, 'Asset')}>
                  <FontAwesome name="trash-o" size={24} color={currentColors.accent} style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentColors.primary }]}
            onPress={() => {
              setModalType('Asset');
              setIsEditing(false);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.addButtonText, { color: currentColors.background }]}>Add Asset</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Adding or Editing Items */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            resetModal();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                {isEditing ? 'Edit' : 'Add New'} {modalType}
              </Text>
              <TextInput
                style={[styles.input, { color: currentColors.text, borderColor: currentColors.primary }]}
                placeholder="Name"
                placeholderTextColor={currentColors.icon}
                value={newName}
                onChangeText={setNewName}
              />
              {(modalType === 'Account' || modalType === 'CreditCard') && (
                <TextInput
                  style={[styles.input, { color: currentColors.text, borderColor: currentColors.primary }]}
                  placeholder="Balance"
                  placeholderTextColor={currentColors.icon}
                  keyboardType="numeric"
                  value={newBalance}
                  onChangeText={setNewBalance}
                />
              )}
              {modalType === 'CreditCard' && (
                <TextInput
                  style={[styles.input, { color: currentColors.text, borderColor: currentColors.primary }]}
                  placeholder="Available Credit"
                  placeholderTextColor={currentColors.icon}
                  keyboardType="numeric"
                  value={newAvailable}
                  onChangeText={setNewAvailable}
                />
              )}
              {modalType === 'Asset' && (
                <>
                  <TextInput
                    style={[styles.input, { color: currentColors.text, borderColor: currentColors.primary }]}
                    placeholder="Value"
                    placeholderTextColor={currentColors.icon}
                    keyboardType="numeric"
                    value={newValue}
                    onChangeText={setNewValue}
                  />
                  <TextInput
                    style={[styles.input, { color: currentColors.text, borderColor: currentColors.primary }]}
                    placeholder="Type (e.g., Real Estate, Investment)"
                    placeholderTextColor={currentColors.icon}
                    value={newType}
                    onChangeText={setNewType}
                  />
                </>
              )}
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
                  <Text style={[styles.modalButtonText, { color: currentColors.background }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

//styles
const styles = StyleSheet.create({
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
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
    color: '#666',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
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
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
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
