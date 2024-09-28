import React, { FC } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PieChart } from 'react-native-gifted-charts';
import { FontAwesome } from '@expo/vector-icons';

//get device screen dimensions
const { height, width } = Dimensions.get('window');

//interface definitions
interface ExpenseItem {
  value: number;
  color: string;
  label: string;
}

interface Account {
  name: string;
  balance: number;
}

interface CreditCard {
  name: string;
  balance: number;
  available: number;
}

interface Asset {
  name: string;
  value: number;
}

const Page: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  //expense data for the interactive graph (will be got from api in next sprint)
  const expenseData: ExpenseItem[] = [
    { value: 500, color: currentColors.accent, label: 'Food' },
    { value: 200, color: currentColors.secondary, label: 'Transport' },
    { value: 300, color: currentColors.primary, label: 'Utilities' },
    { value: 400, color: currentColors.icon, label: 'Rent' },
    { value: 100, color: currentColors.tint, label: 'Entertainment' },
  ];

  //total expenses
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

  //example accounts data (test)
  const accounts: Account[] = [
    { name: 'Checking Account', balance: 2500 },
    { name: 'Savings Account', balance: 10000 },
    { name: 'Investment Account', balance: 15000 },
  ];

  //calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  //credit cards data (test)
  const creditCards: CreditCard[] = [
    { name: 'Visa', balance: 1000, available: 4000 },
    { name: 'MasterCard', balance: 500, available: 3500 },
  ];

  //assets data (test)
  const assets: Asset[] = [
    { name: 'Stocks', value: 20000 },
    { name: 'Real Estate', value: 150000 },
    { name: 'Car', value: 15000 },
  ];

  //important alerts
  const alerts: string[] = [
    'Your electricity bill is due tomorrow.',
    'Unusual spending detected on your Visa card.',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView showsVerticalScrollIndicator= {false} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Graph Section */}
        <View style={styles.graphContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Overview
          </Text>
          <PieChart
            data={expenseData}
            donut
            radius={150}
            innerRadius={100}
            innerCircleColor={currentColors.background}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerLabelAmount, { color: currentColors.text }]}>
                  ${totalExpenses}
                </Text>
                <Text style={[styles.centerLabelText, { color: currentColors.text }]}>
                  Total Expenses
                </Text>
              </View>
            )}
            onPress={(item: ExpenseItem, index: number) => {
              //handle slice press (e.g., navigate to detailed view)
            }}
          />
        </View>

        {/* Accounts Summary */}
        <View style={styles.accountsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Accounts</Text>
          {accounts.map((account, index) => (
            <TouchableOpacity key={index} style={styles.accountItem}>
              <Text style={[styles.accountName, { color: currentColors.text }]}>
                {account.name}
              </Text>
              <Text style={[styles.accountBalance, { color: currentColors.primary }]}>
                ${account.balance}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.totalBalanceContainer}>
            <Text style={[styles.totalBalanceLabel, { color: currentColors.text }]}>
              Total Balance
            </Text>
            <Text style={[styles.totalBalanceValue, { color: currentColors.primary }]}>
              ${totalBalance}
            </Text>
          </View>
        </View>

        {/* Credit Cards Summary */}
        <View style={styles.creditCardsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Credit Cards
          </Text>
          {creditCards.map((card, index) => (
            <TouchableOpacity key={index} style={styles.cardItem}>
              <View>
                <Text style={[styles.cardName, { color: currentColors.text }]}>{card.name}</Text>
                <Text
                  style={[styles.cardAvailable, { color: currentColors.secondary }]}
                >
                  Available: ${card.available}
                </Text>
              </View>
              <Text style={[styles.cardBalance, { color: currentColors.accent }]}>
                Balance: ${card.balance}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assets Overview */}
        <View style={styles.assetsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Assets</Text>
          {assets.map((asset, index) => (
            <TouchableOpacity key={index} style={styles.assetItem}>
              <Text style={[styles.assetName, { color: currentColors.text }]}>
                {asset.name}
              </Text>
              <Text style={[styles.assetValue, { color: currentColors.primary }]}>
                ${asset.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Important Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Important Alerts
          </Text>
          {alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <FontAwesome
                name="exclamation-circle"
                size={20}
                color={currentColors.accent}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.alertText, { color: currentColors.text }]}>{alert}</Text>
            </View>
          ))}
        </View>
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
    paddingBottom: 70
  },
  graphContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  centerLabelText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  accountsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accountName: {
    fontSize: 16,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  totalBalanceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalBalanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  creditCardsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardName: {
    fontSize: 16,
  },
  cardAvailable: {
    fontSize: 14,
    color: '#666',
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  assetName: {
    fontSize: 16,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  alertsContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  alertText: {
    fontSize: 16,
    flex: 1,
  },
});

export default Page;