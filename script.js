function setupEventListeners() {
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    for (let i = 0; i < difficultyInputs.length; i++) {
        difficultyInputs[i].addEventListener('change', function() {
            localStorage.setItem('difficulty', this.value);
        });
    }

    const startQuizButtons = document.querySelectorAll('.start-quiz');
    for (let i = 0; i < startQuizButtons.length; i++) {
        startQuizButtons[i].addEventListener('click', function() {
            const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
            startQuiz(selectedDifficulty);
        });
    }

    const resetButton = document.querySelector('.reset-score');
    if (resetButton) {
        resetButton.addEventListener('click', resetScore);
    }
}

function startQuiz(difficulty) {
    localStorage.removeItem('selectedAnswer'); // Ensure to clear previous answer
    localStorage.setItem('difficulty', difficulty);
    window.location.href = 'questions.html';  // Redirects to the questions page
}

async function fetchQuestion(difficulty) {
    const apiUrl = `https://quizapi.io/api/v1/questions?apiKey=61KQdm9Mah9W8Ryg3Q4oHeQpuVVdk44X9zpSCTna&category=cms&difficulty=${difficulty}&limit=1`

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.length > 0 && data[0].question) { // Make sure that data and question exist
            displayQuestion(data[0]);
        } else {
            console.error('No questions received');
            alert('No questions available for this category and tag.');
        }
    } catch (error) {
        console.error('Error fetching question:', error);
        alert('Failed to fetch questions.');
    }
}

function displayQuestion(question) {
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('answer-form');
    questionContainer.textContent = question.question;
    answersContainer.innerHTML = ''; // Clear previous answers
    
    // Filter out any null values and ensure we are working with an array of answer keys that are not null
    const entries = Object.entries(question.answers).filter(([key, value]) => value != null);

    // Use a for loop to iterate through the filtered entries
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const button = document.createElement('button');
        button.textContent = value;
        button.className = 'btn dif m-2 answer-btn';
        // Assuming question.correct_answers has keys like 'answer_a_correct' and values are either 'true' or 'false'
        button.dataset.correct = question.correct_answers[`${key}_correct`] === "true";
        button.addEventListener('click', function() { selectAnswer(button); });
        answersContainer.appendChild(button);
    }

    // Add a submit button for submitting the answer
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.className = 'btn link rounded-4 mt-4';
    submitButton.addEventListener('click', submitAnswer);
    answersContainer.appendChild(submitButton);
}


function selectAnswer(button) {
    const buttons = document.querySelectorAll('.answer-btn');
    for (let button of buttons) {
        button.style.backgroundColor = ''; // Reset all buttons
    }
    button.style.backgroundColor = 'var(--accent-color)'; // Highlight selected
    localStorage.setItem('selectedAnswer', button.dataset.correct);
}

async function submitAnswer() {
    try {
        const selectedAnswer = localStorage.getItem('selectedAnswer');
        if (!selectedAnswer) {
            alert('Select an answer first!');
            return; // Stop further execution if no answer is selected
        }
        
        const result = selectedAnswer === 'true';
        localStorage.setItem('lastResult', result ? 'Correct!' : 'Wrong!');
        await updateScore(result);
        window.location.href = 'results.html';
    } catch (error) {
        console.error('Failed to submit answer:', error);
    }
}

async function updateScore(isCorrect) {
    const currentScore = parseInt(localStorage.getItem('score') || 0);
    localStorage.setItem('score', isCorrect ? currentScore + 1 : currentScore);
}

function displayResultsIfNeeded() {
    const resultMessage = document.getElementById('result-message');
    const currentScore = document.getElementById('current-score');
    resultMessage.textContent = localStorage.getItem('lastResult');
    currentScore.textContent = localStorage.getItem('score');
}

function resetScore() {
    localStorage.setItem('score', '0');
    document.getElementById('current-score').textContent = '0';
    alert('Score has been reset.');
}

setupEventListeners();

// Determine the appropriate action based on the current page
const path = window.location.pathname;
if (path.includes('questions.html')) {
    const difficulty = localStorage.getItem('difficulty') || 'easy';
    fetchQuestion(difficulty);
} else if (path.includes('results.html')) {
    displayResultsIfNeeded();
}
