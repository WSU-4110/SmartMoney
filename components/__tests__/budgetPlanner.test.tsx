import { Budget, BudgetPlannerLogic } from '../../app/(tabs)/budgetPlanner';

describe('BudgetPlannerLogic', () => {
    const sampleCategories = [
        new Budget('Food', 200, 300),
        new Budget('Housing', 1900, 2100),
        new Budget('Transportation', 250, 500),
        new Budget('Healthcare', 230, 250),
    ];
    let logic: BudgetPlannerLogic;

    beforeEach(() => {
        logic = new BudgetPlannerLogic(sampleCategories);
    });




    test('should calculate the total budget correctly', () => {
        const totalBudget = logic.calculateTotalBudget();
        expect(totalBudget).toBe(3150); // 200 + 1900 + 250 + 230
    });
    

    test('should calculate the total spent correctly', () => {
        const totalSpent = logic.calculateTotalSpent();
        expect(totalSpent).toBe(2580);
    });

    test('should calculate the total remaining budget correctly', () => {
        const totalRemaining = logic.calculateTotalRemaining();
        expect(totalRemaining).toBe(570);
    });

    test('should update budgets correctly', () => {
        const updatedBudgets = logic.updateBudgets([
            { name: 'Food', budget: 400 },
            { name: 'Housing', budget: 2200 },
            { name: 'Transportation', budget: 600 },
            { name: 'Healthcare', budget: 300 },
        ]);

        expect(updatedBudgets[0].budget).toBe(400);
        expect(updatedBudgets[1].budget).toBe(2200);
        expect(updatedBudgets[2].budget).toBe(600);
        expect(updatedBudgets[3].budget).toBe(300);
    });

    test('should add expense to the correct category', () => {
        const updatedCategories = logic.addExpense('Food', 50);
        const foodCategory = updatedCategories.find((category) => category.name === 'Food');
        expect(foodCategory?.spent).toBe(250);
    });



    test('should cap progress at 1 for over-budget categories', () => {
        const { progress } = logic.calculateProgress(350, 300);
        expect(progress).toBe(1);
    });

    test('should calculate progress and color correctly', () => {
        const { progress, color } = logic.calculateProgress(200, 300);
        expect(progress).toBeCloseTo(0.6667, 4); 
        expect(color).toBe('#4CAF50'); // Green color
    });

    test('should assign the correct color for progress > 90%', () => {
        const { color } = logic.calculateProgress(260, 300);
        expect(color).toBe('#FFEB3B'); // Yellow color
    });

    test('should assign the correct color for progress > 100%', () => {
        const { color } = logic.calculateProgress(350, 300);
        expect(color).toBe('red'); // Red color
    });
});
