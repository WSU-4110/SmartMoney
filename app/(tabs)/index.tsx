// Import statements
import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl, // Import RefreshControl
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/apiClient';

// Get device screen dimensions
const { width } = Dimensions.get('window');

// Interface definitions
interface Account {
  id: string;
  name: string;
  balance: number;
}

interface CreditCard {
  id: string;
  name: string;
  balance: number;
  available: number;
}

interface Institution {
  id: string;
  name: string;
  accounts: Account[];
  creditCards: CreditCard[];
}

const Page: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Fetch institutions
      const institutionResponse = await api.post('/user/userinfo', { id: userId });
      const institutionsData = institutionResponse.data.items || [];
      let calculatedBalance = 0;
      console.log('Institutions:', institutionsData);

      const formattedInstitutions: Institution[] = institutionsData.map((institution: any) => {
        const accounts = institution.accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          balance: account.balances[0]?.current || 0,
        }));

        const creditCards =
          institution.creditCards?.map((card: any) => ({
            id: card.id,
            name: card.name,
            balance: card.balances?.current || 0,
            available: card.balances?.available || 0,
          })) || [];

        // Calculate total balance
        calculatedBalance += accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);

        return {
          id: institution.institution.id,
          name: institution.institution.name,
          accounts,
          creditCards,
        };
      });

      setInstitutions(formattedInstitutions);
      setTotalBalance(calculatedBalance);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Interactive Graph Section */}
        <View style={styles.graphContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Overview</Text>
          <PieChart
            data={institutions.map((inst, index) => ({
              value: inst.accounts.reduce((sum, acc) => sum + acc.balance, 0),
              color: [currentColors.accent, currentColors.primary, currentColors.secondary][index % 3],
              label: inst.name,
            }))}
            donut
            radius={150}
            innerRadius={100}
            innerCircleColor={currentColors.background}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerLabelAmount, { color: currentColors.text }]}>
                  ${totalBalance.toFixed(2)}
                </Text>
                <Text style={[styles.centerLabelText, { color: currentColors.text }]}>
                  Total Balance
                </Text>
              </View>
            )}
          />
        </View>

        {/* Accounts Summary by Institution */}
        <View style={styles.accountsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Accounts</Text>
          {institutions.length > 0 ? (
            institutions.map((inst) => (
              <View key={inst.id} style={styles.institutionContainer}>
                <Text style={[styles.institutionName, { color: currentColors.accent }]}>
                  {inst.name}
                </Text>
                {inst.accounts.map((account) => (
                  <TouchableOpacity key={account.id} style={styles.accountItem}>
                    <Text style={[styles.accountName, { color: currentColors.text }]}>
                      {account.name}
                    </Text>
                    <Text style={[styles.accountBalance, { color: currentColors.primary }]}>
                      ${account.balance.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <Text style={[styles.noDataText, { color: currentColors.text }]}>
              No accounts available.
            </Text>
          )}
        </View>

        {/* Credit Cards Summary */}
        <View style={styles.creditCardsContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Credit Cards</Text>
          {institutions.flatMap((inst) => inst.creditCards).length > 0 ? (
            institutions.flatMap((inst) => inst.creditCards).map((card) => (
              <TouchableOpacity key={card.id} style={styles.cardItem}>
                <View>
                  <Text style={[styles.cardName, { color: currentColors.text }]}>{card.name}</Text>
                  <Text style={[styles.cardAvailable, { color: currentColors.secondary }]}>
                    Available: ${card.available.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.cardBalance, { color: currentColors.accent }]}>
                  Balance: ${card.balance.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noDataText, { color: currentColors.text }]}>
              No credit cards available.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: 20, paddingBottom: 70 },
  graphContainer: { alignItems: 'center', marginVertical: 20 },
  centerLabel: { justifyContent: 'center', alignItems: 'center' },
  centerLabelAmount: { fontSize: 24, fontWeight: '600' },
  centerLabelText: { fontSize: 16, color: '#666' },
  sectionTitle: { fontSize: 22, fontWeight: '600', marginBottom: 10 },
  accountsContainer: { marginHorizontal: 20, marginVertical: 10 },
  institutionContainer: { marginBottom: 20 },
  institutionName: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  accountName: { fontSize: 16 },
  accountBalance: { fontSize: 16, fontWeight: '500' },
  creditCardsContainer: { marginHorizontal: 20, marginVertical: 10 },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cardName: { fontSize: 16 },
  cardAvailable: { fontSize: 14, color: '#666' },
  cardBalance: { fontSize: 16, fontWeight: '500' },
  noDataText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});

export default Page;
