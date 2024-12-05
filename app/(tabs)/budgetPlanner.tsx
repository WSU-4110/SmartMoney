import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';

export class Budget {
    name: string;
    spent: number;
    budget: number;

    constructor(name: string, spent: number, budget: number) {
        this.name = name;
        this.spent = spent;
        this.budget = budget;
    }
}

export class BudgetPlannerLogic {
    categories: Budget[];

    constructor(categories: Budget[]) {
        this.categories = categories;
    }

    calculateTotalBudget(): number {
        return this.categories.reduce((total, category) => total + category.budget, 0);
    }

    calculateTotalSpent(): number {
        return this.categories.reduce((total, category) => total + category.spent, 0);
    }

    calculateTotalRemaining(): number {
        return this.calculateTotalBudget() - this.calculateTotalSpent();
    }

    updateBudgets(newBudgets: { name: string; budget: number }[]): Budget[] {
        return this.categories.map((category, index) => ({
            ...category,
            budget: newBudgets[index].budget,
        }));
    }

    addExpense(categoryName: string, expenseAmount: number): Budget[] {
        return this.categories.map((category) => {
            if (category.name === categoryName) {
                return { ...category, spent: category.spent + expenseAmount };
            }
            return category;
        });
    }

    calculateProgress(spent: number, budget: number): { progress: number; color: string } {
        const progress = spent / budget;
        let color;
        if (progress < 0.71) {
            color = '#4CAF50'; // Green
        } else if (progress < 0.91) {
            color = '#FFEB3B'; // Yellow
        } else {
            color = 'red'; // Red
        }
        return { progress: progress > 1 ? 1 : progress, color };
    }
}

const BudgetPlanner = () => {
    const initialCategories = [
        new Budget("Food",0, 300),
        new Budget("Housing", 0, 2100),
        new Budget("Transportation", 0, 500),
        new Budget("Healthcare", 0, 250),
        new Budget("Debt Payment", 0, 1600),
        new Budget("Entertainment", 0, 500),
        new Budget("Personal", 0, 250),
        new Budget("Utilities", 0, 200),
        new Budget("Donation", 0, 100),
        new Budget("Miscellaneous", 0, 500),
    ];

    const [categories, setCategories] = useState<Budget[]>(initialCategories);
    const [modalVisible, setModalVisible] = useState(false);
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [newBudgets, setNewBudgets] = useState(
        categories.map((category) => ({ name: category.name, budget: category.budget }))
    );
    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || "");
    const [expenseAmount, setExpenseAmount] = useState("");

    const logic = new BudgetPlannerLogic(categories);

    const saveBudgets = () => {
        const updatedCategories = logic.updateBudgets(newBudgets);
        setCategories(updatedCategories);
        setModalVisible(false);
    };

    const addExpense = () => {
        const updatedCategories = logic.addExpense(selectedCategory, parseFloat(expenseAmount));
        setCategories(updatedCategories);
        setExpenseModalVisible(false);
        setExpenseAmount("");
    };

    const renderProgressBar = () => {
        return categories.map((category) => {
            const { progress, color } = logic.calculateProgress(category.spent, category.budget);
            const percentSpent = Math.min(progress * 100, 100).toFixed(0);

            return (
                <View key={category.name} style={styles.category}>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.spentText}>
                            ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <Progress.Bar
                            progress={progress}
                            width={null}
                            color={color}
                            borderColor="#d3d3d3"
                            unfilledColor="#f0f0f0"
                            height={30}
                            animated={true}
                        />
                        <Text style={styles.percentText}>{percentSpent}%</Text>
                    </View>
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.budgetSummaryContainer}>
                <Text style={styles.totalBudgetText}>
                    Total Budget: ${logic.calculateTotalBudget().toFixed(2)}
                </Text>
                <Text style={styles.totalExpensesText}>
                    Total Expenses: ${logic.calculateTotalSpent().toFixed(2)}
                </Text>
                <Text style={styles.remainingBudgetText}>
                    Budget Remaining: ${logic.calculateTotalRemaining().toFixed(2)}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Change Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setExpenseModalVisible(true)}>
                    <Text style={styles.buttonText}>Add Expense</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>{renderProgressBar()}</ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Budgets</Text>
                        {newBudgets.map((category, index) => (
                            <View key={category.name} style={styles.inputContainer}>
                                <Text>{category.name}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    defaultValue={category.budget.toString()}
                                    onChangeText={(value) =>
                                        setNewBudgets((prevBudgets) => {
                                            const updatedBudgets = [...prevBudgets];
                                            updatedBudgets[index].budget = parseFloat(value) || 0;
                                            return updatedBudgets;
                                        })
                                    }
                                />
                            </View>
                        ))}
                        <Button title="Save Budgets" onPress={saveBudgets} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={expenseModalVisible}
                onRequestClose={() => setExpenseModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Expense</Text>
                        <Picker
                            selectedValue={selectedCategory}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        >
                            {categories.map((category) => (
                                <Picker.Item key={category.name} label={category.name} value={category.name} />
                            ))}
                        </Picker>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Expense Amount"
                            value={expenseAmount}
                            onChangeText={setExpenseAmount}
                        />
                        <Button title="Add Expense" onPress={addExpense} />
                        <Button title="Cancel" onPress={() => setExpenseModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    budgetSummaryContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#b2ebf2',
        alignItems: 'center',
    },
    totalBudgetText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00796b',
        marginBottom: 5,
    },
    totalExpensesText: {
        fontSize: 16,
        color: '#d32f2f',
        marginBottom: 5,
    },
    remainingBudgetText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#388e3c',
    },
    scrollView: {
        flex: 1,
    },
    category: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    spentText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginBottom: 10,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 15,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressContainer: {
        position: 'relative',
        marginTop: 10,
    },
    percentText: {
        position: 'absolute',
        left: '50%',
        top: 2,
        transform: [{ translateX: -50 }],
        fontWeight: 'bold',
        color: '#fff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
      },
    picker: {
        height: 50,
        width: '100%',
        marginVertical: 10,
      }
});

export default BudgetPlanner;



