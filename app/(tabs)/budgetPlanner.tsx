// Import statements
import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { parse, format } from 'date-fns';

// Get device screen dimensions
const { width } = Dimensions.get('window');

// Interface definitions
interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  type: 'Income' | 'Expense';
}

interface Category {
  name: string;
  color: string;
}

const DataPage: FC = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light'];

  // State variables
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>([
    { name: 'Food', color: currentColors.accent },
    { name: 'Transport', color: currentColors.secondary },
    { name: 'Utilities', color: currentColors.primary },
    { name: 'Entertainment', color: currentColors.icon },
    { name: 'Healthcare', color: currentColors.tertiary },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    amount: '',
    category: '',
    type: 'Expense' as 'Income' | 'Expense',
  });

  // New state for budgets per category
  const [categoryBudgets, setCategoryBudgets] = useState<{ [key: string]: number }>({
    Food: 500,
    Transport: 200,
    Utilities: 300,
    Entertainment: 400,
    Healthcare: 250,
  });

  // New state for category budget modal
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newBudget, setNewBudget] = useState<string>('');

  // Summary metrics
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [netBalance, setNetBalance] = useState<number>(0);

  // Effect to calculate summaries
  useEffect(() => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setTotalIncome(income);
    setTotalExpense(expense);
    setNetBalance(income - expense);
  }, [transactions]);

  // Handlers
  const handleAddTransaction = () => {
    if (
      newTransaction.date &&
      newTransaction.amount &&
      newTransaction.category &&
      !isNaN(parseFloat(newTransaction.amount))
    ) {
      setTransactions([
        ...transactions,
        {
          id: transactions.length + 1,
          date: newTransaction.date,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          type: newTransaction.type,
        },
      ]);
      setNewTransaction({
        date: '',
        amount: '',
        category: '',
        type: 'Expense',
      });
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please fill all fields with valid data');
    }
  };

  const handleSetBudget = () => {
    if (newBudget && selectedCategory && !isNaN(parseFloat(newBudget))) {
      setCategoryBudgets({
        ...categoryBudgets,
        [selectedCategory]: parseFloat(newBudget),
      });
      setNewBudget('');
      setSelectedCategory('');
      setBudgetModalVisible(false);
    } else {
      Alert.alert('Error', 'Please enter a valid budget amount');
    }
  };

  // Assign colors to categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as { [key: string]: string });

  // Data for charts
  const expenseData = transactions.filter((t) => t.type === 'Expense');
  const incomeData = transactions.filter((t) => t.type === 'Income');

  // Group expenses by month for line chart
  const monthlyExpenses = expenseData.reduce((acc, curr) => {
    const dateObj = parse(curr.date);
    const month = format(dateObj, 'yyyy-MM');
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {} as { [key: string]: number });

  const lineChartData = Object.keys(monthlyExpenses)
    .sort()
    .map((month) => ({
      value: monthlyExpenses[month],
      label: month.substr(5, 2), // Extract month
    }));

  // Group expenses by category for bar and pie charts
  const categoryExpenses = categories.map((cat) => {
    const total = expenseData
      .filter((t) => t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    return { category: cat.name, amount: total };
  });

  // Budget progress per category
  const categoryProgress = categoryExpenses.map((item) => {
    const budget = categoryBudgets[item.category] || 0;
    const progress = (item.amount / budget) * 100;
    return {
      category: item.category,
      amount: item.amount,
      budget,
      progress: progress > 100 ? 100 : progress,
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Budget Planner</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: currentColors.tertiary }]}>
            <Text style={[styles.summaryTitle, { color: currentColors.text }]}>Total Income</Text>
            <Text style={[styles.summaryAmount, { color: currentColors.text }]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: currentColors.tertiary }]}>
            <Text style={[styles.summaryTitle, { color: currentColors.text }]}>Total Expense</Text>
            <Text style={[styles.summaryAmount, { color: currentColors.icon }]}>
              ${totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: currentColors.tertiary }]}>
            <Text style={[styles.summaryTitle, { color: currentColors.text }]}>Net Balance</Text>
            <Text style={[styles.summaryAmount, { color: currentColors.primary }]}>
              ${netBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Add Transaction and Set Budget Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentColors.secondary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={currentColors.text} />
            <Text style={[styles.addButtonText, { color: currentColors.text }]}>Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentColors.accent }]}
            onPress={() => setBudgetModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color={currentColors.text} />
            <Text style={[styles.addButtonText, { color: currentColors.text }]}>Set Budgets</Text>
          </TouchableOpacity>
        </View>

        {/* Line Chart for Monthly Spending */}
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: currentColors.text }]}>Monthly Expense Trend</Text>
          <LineChart
            data={lineChartData}
            width={width - 40}
            height={220}
            isAnimated
            spacing={20}
            initialSpacing={10}
            color={currentColors.primary}
            hideDataPoints
            thickness={2}
            yAxisTextStyle={{ color: currentColors.text }}
            xAxisLabelTextStyle={{ color: currentColors.text }}
            yAxisOffset={10}
            noOfSections={4}
            maxValue={Math.max(...lineChartData.map((d) => d.value)) + 100}
            areaChart
            startFillColor={currentColors.primary}
            endFillColor={currentColors.background}
            startOpacity={0.3}
            endOpacity={0}
          />
        </View>

        {/* Bar Chart for Spending by Category with Budget */}
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: currentColors.text }]}>
            Spending vs Budget by Category
          </Text>
          <BarChart
            data={categoryProgress.map((item) => ({
              value: item.amount,
              label: item.category,
              frontColor: categoryColors[item.category] || currentColors.accent,
              topLabelComponent: () => (
                <Text style={{ color: currentColors.text, fontSize: 12 }}>
                  ${item.amount.toFixed(0)}
                </Text>
              ),
            }))}
            width={width - 40}
            height={220}
            barWidth={30}
            spacing={30}
            initialSpacing={15}
            yAxisLabelPrefix="$"
            xAxisLabelTextStyle={{ color: currentColors.text }}
            yAxisTextStyle={{ color: currentColors.text }}
            yAxisOffset={10}
            noOfSections={4}
            maxValue={Math.max(...categoryProgress.map((d) => d.budget)) + 100}
          />
        </View>

        {/* Pie Chart for Expense Distribution */}
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: currentColors.text }]}>
            Expense Distribution
          </Text>
          <PieChart
            data={categoryExpenses.map((item) => ({
              value: item.amount,
              color: categoryColors[item.category] || currentColors.accent,
              text: item.category,
            }))}
            donut
            radius={120}
            innerRadius={70}
            innerCircleColor={currentColors.background}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerLabelAmount, { color: currentColors.text }]}>Total</Text>
                <Text style={[styles.centerLabelText, { color: currentColors.text }]}>
                  ${totalExpense.toFixed(2)}
                </Text>
              </View>
            )}
          />
          {/* Legend */}
          <View style={styles.legendContainer}>
            {categoryExpenses.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColorBox,
                    { backgroundColor: categoryColors[item.category] || currentColors.accent },
                  ]}
                />
                <Text style={[styles.legendText, { color: currentColors.text }]}>{item.category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionContainer}>
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
            Recent Transactions
          </Text>
          {transactions.slice(-5).reverse().map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View>
                <Text style={[styles.transactionCategory, { color: currentColors.text }]}>
                  {item.category}
                </Text>
                <Text style={[styles.transactionDate, { color: currentColors.icon }]}>
                  {item.date}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: item.type === 'Income' ? currentColors.accent : currentColors.icon,
                  },
                ]}
              >
                {item.type === 'Income' ? '+' : '-'}${item.amount.toFixed(2)}
              </Text>
            </View>

            <ScrollView style={styles.scrollView}>{renderProgressBar()}</ScrollView>

        {/* Modal for Adding Transactions */}
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalView, { backgroundColor: currentColors.background }]}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Add Transaction</Text>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentColors.icon, color: currentColors.text },
                ]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={currentColors.icon}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, date: text })}
                value={newTransaction.date}
              />
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentColors.icon, color: currentColors.text },
                ]}
                placeholder="Amount"
                placeholderTextColor={currentColors.icon}
                keyboardType="numeric"
                onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
                value={newTransaction.amount}
              />
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentColors.icon, color: currentColors.text },
                ]}
                placeholder="Category"
                placeholderTextColor={currentColors.icon}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, category: text })}
                value={newTransaction.category}
              />
              <View style={styles.typeSwitch}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: currentColors.tertiary },
                    newTransaction.type === 'Expense' && { backgroundColor: currentColors.primary },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'Expense' })}
                >
                  <Text style={styles.typeButtonText}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { backgroundColor: currentColors.tertiary },
                    newTransaction.type === 'Income' && { backgroundColor: currentColors.primary },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'Income' })}
                >
                  <Text style={styles.typeButtonText}>Income</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: currentColors.accent }]}
                  onPress={handleAddTransaction}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: currentColors.icon }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal for Setting Budgets */}
        <Modal
          animationType="slide"
          transparent
          visible={budgetModalVisible}
          onRequestClose={() => setBudgetModalVisible(!budgetModalVisible)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalView, { backgroundColor: currentColors.background }]}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>Set Budget</Text>
              <Text style={[styles.modalSubtitle, { color: currentColors.text }]}>
                Select Category
              </Text>
              <View style={styles.categoryList}>
                {categories.map((cat, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: currentColors.tertiary },
                      selectedCategory === cat.name && { backgroundColor: currentColors.accent },
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Text style={[styles.categoryItemText, { color: currentColors.text }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: currentColors.icon, color: currentColors.text },
                ]}
                placeholder="Budget Amount"
                placeholderTextColor={currentColors.icon}
                keyboardType="numeric"
                onChangeText={(text) => setNewBudget(text)}
                value={newBudget}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                  onPress={handleSetBudget}
                >
                  <Text style={styles.modalButtonText}>Set Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: currentColors.icon }]}
                  onPress={() => setBudgetModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  addButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabelAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
  centerLabelText: {
    fontSize: 16,
    color: '#666',
  },
  legendContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  legendText: {
    fontSize: 16,
  },
  transactionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transactionCategory: {
    fontSize: 16,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000099',
  },
  modalView: {
    margin: 20,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  typeSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryItem: {
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  categoryItemText: {
    fontSize: 16,
  },
});

export default DataPage;
