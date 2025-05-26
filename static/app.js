// State management
const state = {
    currentResponse: '',
    history: [],
    isLoading: false
};

// DOM Elements
const elements = {
    promptInput: document.getElementById('promptInput'),
    responseOutput: document.getElementById('responseOutput'),
    evaluationOutput: document.getElementById('evaluationOutput'),
    generateLoading: document.getElementById('generateLoading'),
    evaluateLoading: document.getElementById('evaluateLoading'),
    historyContainer: document.getElementById('historyContainer')
};

// Utility functions
const showLoading = (element) => {
    element.style.display = 'inline-block';
    state.isLoading = true;
};

const hideLoading = (element) => {
    element.style.display = 'none';
    state.isLoading = false;
};

const showError = (message, container) => {
    container.innerHTML = `
        <div class="error-message">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
};

const addToHistory = (prompt, response, evaluation) => {
    state.history.unshift({
        prompt,
        response,
        evaluation,
        timestamp: new Date().toISOString()
    });
    updateHistoryDisplay();
};

const updateHistoryDisplay = () => {
    if (!elements.historyContainer) return;
    
    elements.historyContainer.innerHTML = state.history
        .map(item => `
            <div class="history-item card">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-semibold">Prompt:</p>
                        <p class="text-gray-600">${item.prompt}</p>
                        <p class="font-semibold mt-2">Response:</p>
                        <p class="text-gray-600">${item.response}</p>
                    </div>
                    <div class="evaluation-badge ${item.evaluation.toLowerCase()}">
                        ${item.evaluation.toUpperCase()}
                    </div>
                </div>
                <div class="text-sm text-gray-500 mt-2">
                    ${new Date(item.timestamp).toLocaleString()}
                </div>
            </div>
        `)
        .join('');
};

// API calls
async function generateResponse() {
    if (state.isLoading) return;
    
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        showError('Please enter a prompt', elements.responseOutput);
        return;
    }

    showLoading(elements.generateLoading);
    elements.responseOutput.textContent = '';

    try {
        const response = await fetch('/bias/llm_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        state.currentResponse = data.response;
        elements.responseOutput.innerHTML = `
            <div class="response-content">
                <p>${data.response}</p>
            </div>
        `;
    } catch (error) {
        showError(`Error generating response: ${error.message}`, elements.responseOutput);
    } finally {
        hideLoading(elements.generateLoading);
    }
}

async function evaluateBias() {
    if (state.isLoading) return;
    
    if (!state.currentResponse) {
        showError('Please generate a response first', elements.evaluationOutput);
        return;
    }

    showLoading(elements.evaluateLoading);
    elements.evaluationOutput.textContent = '';

    try {
        const response = await fetch('/bias/evaluation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: elements.promptInput.value,
                response: state.currentResponse
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const evaluation = data.bias_evaluation;
        
        elements.evaluationOutput.innerHTML = `
            <div class="evaluation-result ${evaluation.toLowerCase()}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${evaluation === 'biased' ? 
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' :
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                    }
                </svg>
                <span class="font-bold">${evaluation.toUpperCase()}</span>
            </div>
            <div class="text-sm text-gray-600">
                Saved to: ${data.saved_to}
            </div>
        `;

        // Add to history
        addToHistory(elements.promptInput.value, state.currentResponse, evaluation);
    } catch (error) {
        showError(`Error evaluating bias: ${error.message}`, elements.evaluationOutput);
    } finally {
        hideLoading(elements.evaluateLoading);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    elements.promptInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateResponse();
        }
    });

    // Add input validation
    elements.promptInput.addEventListener('input', (e) => {
        if (e.target.value.length > 500) {
            e.target.value = e.target.value.slice(0, 500);
        }
    });
}); 