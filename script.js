// Initializes event listeners when the page loads to enable user interaction.
setupListeners();

function setupListeners() {
    // Attaches event listeners to all quiz start buttons to handle quiz initiation.
    const startButtons = document.querySelectorAll('.start-quiz');
    for (let i = 0; i < startButtons.length; i++) {
        startButtons[i].addEventListener('click', () => {
            // Fetches the difficulty level set by the user to tailor quiz questions.
            const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
            // Changes to the quiz UI section in preparation for displaying questions.
            switchSection('quiz-section');
            // Begins the quiz with the chosen difficulty setting.
            startQuiz(difficulty);
        });
    }

    // Attaches event listeners to reset buttons to allow score resetting.
    const resetButtons = document.querySelectorAll('.reset-score');
    for (let i = 0; i < resetButtons.length; i++) {
        resetButtons[i].addEventListener('click', () => {
            // Resets the user's score to zero.
            resetScore();
            // Returns the user to the home screen after resetting the score.
            switchSection('home-section');
        });
    }

    // Monitors changes in difficulty selection to store user preferences.
    const difficultyChoices = document.querySelectorAll('input[name="difficulty"]');
    for (let i = 0; i < difficultyChoices.length; i++) {
        difficultyChoices[i].addEventListener('change', () => {
            // Saves the selected difficulty in local storage for later use.
            localStorage.setItem('difficulty', difficultyChoices[i].value);
        });
    }
}

function startQuiz() {
    // Retrieves the difficulty setting from local storage to fetch appropriate questions.
    const difficulty = localStorage.getItem('difficulty');
    // Clears any previous answer to prepare for new questions.
    localStorage.removeItem('selectedAnswer');
    // Requests a new question based on the selected difficulty.
    fetchQuestion(difficulty);
}

async function fetchQuestion(difficulty) {
    // Constructs the API URL with the API key and difficulty parameter.
    const apiUrl = `https://quizapi.io/api/v1/questions?apiKey=61KQdm9Mah9W8Ryg3Q4oHeQpuVVdk44X9zpSCTna&category=cms&difficulty=${difficulty}&limit=1`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.length > 0 && data[0].question) {
            // If data is successfully retrieved, it stores it and shows the question.
            localStorage.setItem('currentQuestion', JSON.stringify(data[0]));
            showQuestion(data[0]);
        } else {
            // Handles cases where no questions are available.
            console.log('No questions found');
        }
    } catch (error) {
        // Provides feedback on errors during the fetch operation.
        console.log('Error fetching question:', error);
    }
}

function showQuestion(question) {
    const questionText = document.getElementById('question');
    const answersBlock = document.getElementById('answer-form');
    // Displays the question text.
    questionText.textContent = question.question;
    // Clears previous answers to make way for new ones.
    answersBlock.innerHTML = '';

    // Creates a button for each possible answer and sets up click event listeners.
    const entries = Object.entries(question.answers);
    for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] != null) {
            const answerButton = document.createElement('button');
            answerButton.textContent = entries[i][1];
            answerButton.className = 'btn dif m-2 answer-btn';
            // Stores whether the answer is correct within the button for scoring.
            answerButton.dataset.correct = question.correct_answers[`${entries[i][0]}_correct`] === "true";
            answerButton.addEventListener('click', () => selectAnswer(answerButton));
            answersBlock.appendChild(answerButton);
        }
    }

    // Adds a submit button to allow submitting the selected answer.
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.className = 'btn link rounded-4 mt-4';
    submitButton.addEventListener('click', submitAnswer);
    answersBlock.appendChild(submitButton);
}

function selectAnswer(button) {
    // Handles the selection of an answer by the user.
    const buttons = document.querySelectorAll('.answer-btn');
    for (let i = 0; i < buttons.length; i++) {
        // Resets styling for all answer buttons.
        buttons[i].style.backgroundColor = '';
        buttons[i].style.color = '';
    }
    // Highlights the selected answer button.
    button.style.backgroundColor = 'var(--accent-color)';
    button.style.color = 'var(--dark-color)';
    // Saves the correctness of the selected answer for later evaluation.
    localStorage.setItem('selectedAnswer', button.dataset.correct);
}

async function submitAnswer() {
    // Processes the submission of an answer and updates the score accordingly.
    const selectedAnswer = localStorage.getItem('selectedAnswer');
    if (!selectedAnswer) {
        // Ensures an answer is selected before submission.
        console.log('Select an answer first!');
        return;
    }

    // Checks if the selected answer is correct and updates the score.
    const result = selectedAnswer === 'true';
    localStorage.setItem('lastResult', result ? 'Correct!' : 'Wrong!');
    await updateScore(result);
    // Switches to the results section to show the outcome.
    switchSection('results-section');
}

async function updateScore(isCorrect) {
    // Updates the user's score in local storage and updates the score display.
    const currentScore = parseInt(localStorage.getItem('score') || 0);
    // Increments the score if the answer is correct.
    localStorage.setItem('score', isCorrect ? currentScore + 1 : currentScore);
    displayResults();
}

function displayResults() {
    // Displays the results of the quiz attempt.
    const resultMessage = document.getElementById('result-message');
    const currentScore = document.getElementById('current-score');
    // Shows the result of the last answer and the total score.
    resultMessage.textContent = localStorage.getItem('lastResult');
    currentScore.textContent = localStorage.getItem('score');
}

function resetScore() {
    // Resets the score to zero and updates the UI to reflect the reset.
    localStorage.setItem('score', '0');
    document.getElementById('current-score').textContent = '0';
    console.log('Score has been reset.');
}

function switchSection(sectionId) {
    // Changes the displayed section of the application based on the user's interaction.
    const sections = document.querySelectorAll('.quiz-container');
    for (let i = 0; i < sections.length; i++) {
        // Hides all sections except the one that matches the given ID.
        sections[i].style.display = sections[i].id === sectionId ? 'block' : 'none';
    }

    // Updates the results display if switching to the results section.
    if (sectionId === 'results-section') {
        displayResults();
    }
}
