import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Progress from 'react-native-progress';

const BudgetPlanner = () => {
    const [categories, setCategories] = useState([
        { name: 'Food', spent: 200.00, budget: 300.00 },
        { name: 'Housing', spent: 1900.00, budget: 2100.00 },
        { name: 'Transportation', spent: 250.00, budget: 500.00 },
        { name: 'Healthcare', spent: 230.00, budget: 250.00 },
        { name: 'Debt Payment', spent: 1100.00, budget: 1600.00 },
        { name: 'Entertainment', spent: 25.00, budget: 300.00 },
        { name: 'Personal', spent: 50.00, budget: 250.00 },
        { name: 'Utilities', spent: 300.00, budget: 350.00 },
        { name: 'Donation', spent: 80.00, budget: 100.00 },
        { name: 'Miscellaneous', spent: 160.00, budget: 200.00 }
    ]);
//calculates information at the top of the page
    const totalBudget = categories.reduce((total, category) => total + category.budget, 0);
    const totalSpent = categories.reduce((total, category) => total + category.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
//this is the progress bar of the budget
    const renderProgressBar = () => {
        return categories.map((category) => {
            const progress = category.spent / category.budget;
            let color;
//calculates the percentage of the bar
            const percent = Math.min(progress * 100, 100).toFixed(0);

            if (progress < 0.71) {
                color = '#4CAF50'; //green color
            } else if (progress < 0.91) {
                color = '#FFEB3B'; // yellow color
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
                        <Text style={styles.percentText}>{percent}%</Text>
                    </View>
                </View>
            );
        });
    };
//this part is the banner at the top of the page
    return (
        <View style={styles.container}>
            <View style={styles.budgetSummaryContainer}>
                <Text style={styles.totalBudgetText}>Total Budget: ${totalBudget.toFixed(2)}</Text>
                <Text style={styles.totalExpensesText}>Total Expenses: ${totalSpent.toFixed(2)}</Text>
                <Text style={styles.remainingBudgetText}>Budget Remaining: ${totalRemaining.toFixed(2)}</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {renderProgressBar()}
            </ScrollView>
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
});

export default BudgetPlanner;
