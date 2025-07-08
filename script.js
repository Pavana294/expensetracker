
const form = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmountDisplay = document.getElementById('total-amount');
const submitBtn = document.getElementById('submit-btn');
const ctx = document.getElementById('expense-chart').getContext('2d');

let total = 0;
let editMode = false;
let editIndex = null;

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart;

window.addEventListener('DOMContentLoaded', () => {
    renderExpenses();
    updateTotal();
    updateChart();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert('Please enter valid data.');
        return;
    }

    if (editMode) {
        expenses[editIndex] = { name, amount, category };
        editMode = false;
        editIndex = null;
        submitBtn.textContent = 'Add Expense';
    } else {
        expenses.push({ name, amount, category });
    }

    saveExpenses();
    renderExpenses();
    updateTotal();
    updateChart();
    form.reset();
});

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.index = index;
        li.innerHTML = `
            <div>
                <strong class="expense-name">${expense.name}</strong>
                <span class="badge bg-primary">${expense.category}</span>
            </div>
            <div>
                <span class="amount">₹${expense.amount.toFixed(2)}</span>
                <button class="btn btn-sm btn-info edit ms-2">✏️</button>
                <button class="btn btn-sm btn-danger delete ms-2">🗑️</button>
            </div>
        `;
        expenseList.appendChild(li);
    });
}

function updateTotal() {
    total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    totalAmountDisplay.textContent = total.toFixed(2);
}

expenseList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const index = parseInt(li.dataset.index);

    if (e.target.classList.contains('delete')) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses.splice(index, 1);
            saveExpenses();
            renderExpenses();
            updateTotal();
            updateChart();
        }
    }

    if (e.target.classList.contains('edit')) {
        const expense = expenses[index];
        document.getElementById('expense-name').value = expense.name;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-category').value = expense.category;

        editMode = true;
        editIndex = index;
        submitBtn.textContent = 'Update Expense';
    }
});

function updateChart() {
    const categoryTotals = {};
    expenses.forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const data = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e',
                '#e74a3b', '#858796', '#fd7e14', '#20c997', '#6f42c1', '#d63384'
            ],
        }]
    };

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: data,
    });
}
