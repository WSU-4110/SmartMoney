import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import * as Progress from 'react-native-progress';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';


//The builder design pattern was used 

//This is the budget class
class Budget {
    name: string;
    spent: number;
    budget: number;

    constructor(name: string, spent: number, budget: number) {
        this.name = name;
        this.spent = spent;
        this.budget = budget;
    }
}

// This is the Builder Abstract class 
abstract class BudgetBuilder {
    protected name: string = "";
    protected spent: number = 0;
    protected budget: number = 0;

    setSpent(spent: number): BudgetBuilder {
        this.spent = spent;
        return this;
    }

    setBudget(budget: number): BudgetBuilder {
        this.budget = budget;
        return this;
    }

    abstract build(): Budget;
}

// These are the specific builders for each type of budget
class FoodBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Food";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class HousingBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Housing";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class TransportationBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Transportation";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class HealthcareBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Healthcare";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class DebtPaymentBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Debt Payment";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class EntertainmentBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Entertainment";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class PersonalBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Personal";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class UtilitiesBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Utilities";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class DonationBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Donation";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

class MiscellaneousBudgetBuilder extends BudgetBuilder {
    constructor() {
        super();
        this.name = "Miscellaneous";
    }
    build(): Budget {
        return new Budget(this.name, this.spent, this.budget);
    }
}

const BudgetPlanner = () => {
    const initialCategories = [
        new FoodBudgetBuilder().setSpent(200).setBudget(300).build(),
        new HousingBudgetBuilder().setSpent(1900).setBudget(2100).build(),
        new TransportationBudgetBuilder().setSpent(250).setBudget(500).build(),
        new HealthcareBudgetBuilder().setSpent(230).setBudget(250).build(),
        new DebtPaymentBudgetBuilder().setSpent(1100).setBudget(1600).build(),
        new EntertainmentBudgetBuilder().setSpent(25).setBudget(300).build(),
        new PersonalBudgetBuilder().setSpent(50).setBudget(250).build(),
        new UtilitiesBudgetBuilder().setSpent(300).setBudget(350).build(),
        new DonationBudgetBuilder().setSpent(80).setBudget(100).build(),
        new MiscellaneousBudgetBuilder().setSpent(160).setBudget(200).build()
    ];

    const [categories, setCategories] = useState<Budget[]>(initialCategories);
    const [modalVisible, setModalVisible] = useState(false);
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);
    const [newBudgets, setNewBudgets] = useState(
        categories.map(category => ({ name: category.name, budget: category.budget }))
    );

    const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || "");
    const [expenseAmount, setExpenseAmount] = useState("");
//calculates information at the top of the page

    const totalBudget = categories.reduce((total, category) => total + category.budget, 0);
    const totalSpent = categories.reduce((total, category) => total + category.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
//this is the progress bar of the budget

    const renderProgressBar = () => {
        return categories.map((category, index) => {
            const progress = category.spent / category.budget;
            let color;
            //calculates the percentage of the bar

            const percentSpent = Math.min(progress * 100, 100).toFixed(0);

            if (progress < 0.71) {
                color = '#4CAF50'; //green color
            } else if (progress < 0.91) {
                color = '#FFEB3B'; //yellow color
            } else {
                color = 'red'; //red color
            }

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
                            progress={progress > 1 ? 1 : progress}
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

    const saveBudgets = () => {
        const updatedCategories = categories.map((category, index) => ({
            ...category,
            budget: newBudgets[index].budget,
        }));
        setCategories(updatedCategories);
        setModalVisible(false);
    };

    const addExpense = () => {
        const updatedCategories = categories.map(category => {
            if (category.name === selectedCategory) {
                return { ...category, spent: category.spent + parseFloat(expenseAmount) };
            }
            return category;
        });
        setCategories(updatedCategories);
        setExpenseModalVisible(false);
        setExpenseAmount("");
    };

//this part is the banner at the top of the page

    return (
        <View style={styles.container}>
            <View style={styles.budgetSummaryContainer}>
                <Text style={styles.totalBudgetText}>Total Budget: ${totalBudget.toFixed(2)}</Text>
                <Text style={styles.totalExpensesText}>Total Expenses: ${totalSpent.toFixed(2)}</Text>
                <Text style={styles.remainingBudgetText}>Budget Remaining: ${totalRemaining.toFixed(2)}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Change Budget</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setExpenseModalVisible(true)}>
                    <Text style={styles.buttonText}>Add Expense</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {renderProgressBar()}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
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
                                    onChangeText={value => {
                                        
                                        setNewBudgets(prevBudgets => {
                                            const updatedBudgets = [...prevBudgets];
                                            updatedBudgets[index].budget = parseFloat(value) || 0; 
                                            return updatedBudgets;
                                        });
                                    }}
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
                onRequestClose={() => setExpenseModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Expense</Text>
                        <Picker
                            selectedValue={selectedCategory}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        >
                            {categories.map(category => (
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
//this part edits the layout of the page

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
        borderColor: Colors.light.primary,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: Colors.light.text,
        backgroundColor: Colors.light.tertiary,
        marginBottom: 20,
      },
    picker: {
        height: 50,
        width: '100%',
        color: Colors.light.primary,
        backgroundColor: Colors.light.secondary,
        marginVertical: 10,
      }
});

export default BudgetPlanner;


