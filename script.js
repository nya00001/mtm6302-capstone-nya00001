setupListeners();

function setupListeners() {
    const startButtons = document.querySelectorAll('.start-quiz');
    for (let i = 0; i < startButtons.length; i++) {
        startButtons[i].addEventListener('click', () => {
            const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
            switchSection('quiz-section');
            startQuiz(difficulty);
        });
    }

    const resetButtons = document.querySelectorAll('.reset-score');
    for (let i = 0; i < resetButtons.length; i++) {
        resetButtons[i].addEventListener('click', () => {
            resetScore();
            switchSection('home-section');
        });
    }

    const difficultyChoices = document.querySelectorAll('input[name="difficulty"]');
    for (let i = 0; i < difficultyChoices.length; i++) {
        difficultyChoices[i].addEventListener('change', () => {
            localStorage.setItem('difficulty', difficultyChoices[i].value);
        });
    }
}

function startQuiz() {
    const difficulty = localStorage.getItem('difficulty');

    localStorage.removeItem('selectedAnswer');
    fetchQuestion(difficulty);
}
async function fetchQuestion(difficulty) {
    const apiUrl = `https://quizapi.io/api/v1/questions?apiKey=61KQdm9Mah9W8Ryg3Q4oHeQpuVVdk44X9zpSCTna&category=cms&difficulty=${difficulty}&limit=1`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.length > 0 && data[0].question) {
            localStorage.setItem('currentQuestion', JSON.stringify(data[0]));
            showQuestion(data[0]);
        } else {
            console.error('No questions found');
            alert('No questions available for this category and difficulty.');
        }
    } catch (error) {
        console.error('Error fetching question:', error);
        alert('Failed to fetch questions.');
    }
}

function showQuestion(question) {
    const questionText = document.getElementById('question');
    const answersBlock = document.getElementById('answer-form');
    questionText.textContent = question.question;
    answersBlock.innerHTML = '';

    const entries = Object.entries(question.answers);
    for (let i = 0; i < entries.length; i++) {
        if (entries[i][1] != null) {
            const answerButton = document.createElement('button');
            answerButton.textContent = entries[i][1];
            answerButton.className = 'btn dif m-2 answer-btn';
            answerButton.dataset.correct = question.correct_answers[`${entries[i][0]}_correct`] === "true";
            answerButton.addEventListener('click', () => selectAnswer(answerButton));
            answersBlock.appendChild(answerButton);
        }
    }

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.className = 'btn link rounded-4 mt-4';
    submitButton.addEventListener('click', submitAnswer);
    answersBlock.appendChild(submitButton);
}

function selectAnswer(button) {
    const buttons = document.querySelectorAll('.answer-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = '';
    }
    button.style.backgroundColor = 'var(--accent-color)';
    localStorage.setItem('selectedAnswer', button.dataset.correct);
}

async function submitAnswer() {
    const selectedAnswer = localStorage.getItem('selectedAnswer');
    if (!selectedAnswer) {
        alert('Select an answer first!');
        return;
    }

    const result = selectedAnswer === 'true';
    localStorage.setItem('lastResult', result ? 'Correct!' : 'Wrong!');
    await updateScore(result);
    switchSection('results-section');
}

async function updateScore(isCorrect) {
    const currentScore = parseInt(localStorage.getItem('score') || 0);
    localStorage.setItem('score', isCorrect ? currentScore + 1 : currentScore);
    displayResults();
}

function displayResults() {
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

function switchSection(sectionId) {
    const sections = document.querySelectorAll('.quiz-container');
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = sections[i].id === sectionId ? 'block' : 'none';
    }

    if (sectionId === 'results-section') {
        displayResults();
    }
}
