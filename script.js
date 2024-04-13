// Initialize event listeners when the page loads to enable user interaction.
setupListeners();

function setupListeners() {
    // Attach event listeners to all quiz start buttons to handle quiz initiation.
    const startButtons = document.querySelectorAll('.start-quiz');
    for (let i = 0; i < startButtons.length; i++) {
        startButtons[i].addEventListener('click', () => {
            // Fetch the difficulty level set by the user to tailor quiz questions.
            const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
            // Change to the quiz UI section in preparation for displaying questions.
            switchSection('quiz-section');
            // Begin the quiz with the chosen difficulty setting.
            startQuiz(difficulty);
        });
    }

    // Attach event listeners to reset buttons to allow score resetting.
    const resetButtons = document.querySelectorAll('.reset-score');
    for (let i = 0; i < resetButtons.length; i++) {
        resetButtons[i].addEventListener('click', () => {
            // Reset the user's score to zero and provide feedback.
            resetScore();
            // Return the user to the home screen after resetting the score.
            switchSection('home-section');
        });
    }

    // Monitor changes in difficulty selection to store user preferences.
    const difficultyChoices = document.querySelectorAll('input[name="difficulty"]');
    for (let i = 0; i < difficultyChoices.length; i++) {
        difficultyChoices[i].addEventListener('change', () => {
            // Save the selected difficulty in local storage for later use.
            localStorage.setItem('difficulty', difficultyChoices[i].value);
        });
    }
}

function startQuiz() {
    // Retrieve the difficulty setting from local storage to fetch appropriate questions.
    const difficulty = localStorage.getItem('difficulty');

    // Clear any previous answer to prepare for new questions.
    localStorage.removeItem('selectedAnswer');
    // Request a new question based on the selected difficulty.
    fetchQuestion(difficulty);
}

// Fetch a quiz question from the API based on the difficulty.
async function fetchQuestion(difficulty) {
    // Construct the API URL with the API key and difficulty parameter.
    const apiUrl = `https://quizapi.io/api/v1/questions?apiKey=61KQdm9Mah9W8Ryg3Q4oHeQpuVVdk44X9zpSCTna&category=cms&difficulty=${difficulty}&limit=1`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.length > 0 && data[0].question) {
            // If data is successfully retrieved, store it and show the question.
            localStorage.setItem('currentQuestion', JSON.stringify(data[0]));
            showQuestion(data[0]);
        } else {
            // Handle cases where no questions are available.
            console.error('No questions found');
            alert('No questions available for this category and difficulty.');
        }
    } catch (error) {
        // Provide feedback on errors during the fetch operation.
        console.error('Error fetching question:', error);
        alert('Failed to fetch questions.');
    }
}

// Render the fetched question and its possible answers.
function showQuestion(question) {
    const questionText = document.getElementById('question');
    const answersBlock = document.getElementById('answer-form');
    // Display the question text.
    questionText.textContent = question.question;
    // Clear previous answers to make way for new ones.
    answersBlock.innerHTML = '';

    // Create a button for each possible answer and set up click event listeners.
    const entries = Object.entries(question.answers);
    for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] != null) {
            const answerButton = document.createElement('button');
            answerButton.textContent = entries[i][1];
            answerButton.className = 'btn dif m-2 answer-btn';
            // Store whether the answer is correct within the button for scoring.
            answerButton.dataset.correct = question.correct_answers[`${entries[i][0]}_correct`] === "true";
            answerButton.addEventListener('click', () => selectAnswer(answerButton));
            answersBlock.appendChild(answerButton);
        }
    }

    // Add a submit button to allow submitting the selected answer.
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.className = 'btn link rounded-4 mt-4';
    submitButton.addEventListener('click', submitAnswer);
    answersBlock.appendChild(submitButton);
}

// Handle the selection of an answer by the user.
function selectAnswer(button) {
    const buttons = document.querySelectorAll('.answer-btn');
    for (let i = 0; i < buttons.length; i++) {
        // Reset styling for all answer buttons.
        buttons[i].style.backgroundColor = '';
        buttons[i].style.color = '';  // Reset text color to default
    }
    // Highlight the selected answer button.
    button.style.backgroundColor = 'var(--accent-color)';  // Set background color
    button.style.color = 'var(--dark-color)';  // Set text color for contrast
    // Save the correctness of the selected answer for later evaluation.
    localStorage.setItem('selectedAnswer', button.dataset.correct);
}

// Process the submission of an answer and update the score accordingly.
async function submitAnswer() {
    const selectedAnswer = localStorage.getItem('selectedAnswer');
    if (!selectedAnswer) {
        // Ensure an answer is selected before submission.
        alert('Select an answer first!');
        return;
    }

    // Check if the selected answer is correct and update the score.
    const result = selectedAnswer === 'true';
    localStorage.setItem('lastResult', result ? 'Correct!' : 'Wrong!');
    await updateScore(result);
    // Switch to the results section to show the outcome.
    switchSection('results-section');
}

// Update the user's score in local storage and update the score display.
async function updateScore(isCorrect) {
    const currentScore = parseInt(localStorage.getItem('score') || 0);
    // Increment the score if the answer is correct.
    localStorage.setItem('score', isCorrect ? currentScore + 1 : currentScore);
    displayResults();
}

// Display the results of the quiz attempt.
function displayResults() {
    const resultMessage = document.getElementById('result-message');
    const currentScore = document.getElementById('current-score');
    // Show the result of the last answer and the total score.
    resultMessage.textContent = localStorage.getItem('lastResult');
    currentScore.textContent = localStorage.getItem('score');
}

// Reset the score to zero and update the UI to reflect the reset.
function resetScore() {
    localStorage.setItem('score', '0');
    document.getElementById('current-score').textContent = '0';
    alert('Score has been reset.');
}

// Change the displayed section of the application based on the user's interaction.
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.quiz-container');
    for (let i = 0; i < sections.length; i++) {
        // Hide all sections except the one that matches the given ID.
        sections[i].style.display = sections[i].id === sectionId ? 'block' : 'none';
    }

    // Update the results display if switching to the results section.
    if (sectionId === 'results-section') {
        displayResults();
    }
}
