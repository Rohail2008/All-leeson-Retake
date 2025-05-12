let quizData = [];
let currentQuestion = 0;
let score = 0;
let currentLesson = "";

const lessonCodes = {
    "L1": { take: "727786", retake: "L1RETAKE" },
    "L2": { take: "414740", retake: "L2RETAKE" },
    "L3": { take: "713612", retake: "L3RETAKE" },
    "L4": { take: "869449", retake: "L4RETAKE" },
    "L5": { take: "634562", retake: "L5RETAKE" },
    "L6": { take: "398403", retake: "L6RETAKE" },
    "L7": { take: "483994", retake: "L7RETAKE" },
    "L8": { take: "864681", retake: "L8RETAKE" },
    "L9": { take: "793891", retake: "L9RETAKE" },
    "L10": { take: "847032", retake: "L10RETAKE" },
    "L11": { take: "992523", retake: "L11RETAKE" },
    "L12": { take: "966692", retake: "L12RETAKE" },
    "L13": { take: "457016", retake: "L13RETAKE" },
    "L14": { take: "423545", retake: "L14RETAKE" },
    "L15": { take: "256258", retake: "L15RETAKE" },
    "L16": { take: "963943", retake: "L16RETAKE" }
};

// DOM Elements
const welcomePage = document.getElementById("welcome-page");
const codePage = document.getElementById("code-page");
const quizPage = document.getElementById("quiz-page");
const scorePage = document.getElementById("score-page");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-btn");
const scoreElement = document.getElementById("score");
const codeInputElement = document.getElementById("code-input");
const submitCodeButton = document.getElementById("submit-code-btn");
const retakeQuizButton = document.getElementById("retake-quiz-btn");
const errorMessageElement = document.getElementById("error-message");
const startQuizButton = document.getElementById("start-quiz-btn");

// --- Event Listeners ---

startQuizButton.addEventListener("click", () => {
    showPage("code");
});

submitCodeButton.addEventListener("click", () => {
    submitCode();
});

nextButton.addEventListener("click", () => {
    nextQuestion();
});

retakeQuizButton.addEventListener("click", () => {
    retakeQuiz();
});

// --- Page Navigation Functions ---

function showPage(name) {
    welcomePage.style.display = name === "welcome" ? "block" : "none";
    codePage.style.display = name === "code" ? "block" : "none";
    quizPage.style.display = name === "quiz" ? "block" : "none";
    scorePage.style.display = name === "score" ? "block" : "none";
}

// --- Quiz Logic Functions ---

function loadQuiz(lessonKey, code) {
    fetch(`lesson${lessonKey.slice(1)}.json`)
        .then(res => res.json())
        .then(data => {
            if (data.code !== code) {
                alert("Code does not match lesson file.");
                return;
            }
            quizData = data.questions;
            resetQuizState();
            showPage("quiz");
            showQuestion();
        })
        .catch((error) => {
            console.error("Error loading quiz:", error);
            alert("Error loading quiz data.");
        });
}

function showQuestion() {
    if (!isValidQuestionState()) return;

    const q = quizData[currentQuestion];
    questionElement.textContent = `Q${currentQuestion + 1}: ${q.question}`;
    optionsElement.innerHTML = "";
    nextButton.disabled = false; // Enable next button by default

    if (q.type === "mcq") {
        displayMCQOptions(q.options);
    } else if (q.type === "truefalse") {
        displayTrueFalseOptions();
    } else if (q.type === "short" || q.type === "blank") {
        displayTextInput();
        nextButton.disabled = true; // Disable until input is given
        const answerInput = optionsElement.querySelector('input[name="quiz-option"]');
        if (answerInput) {
            answerInput.addEventListener('input', () => {
                nextButton.disabled = answerInput.value.trim() === "";
            });
        }
    }
}

function checkAnswer() {
    if (!isValidQuestionState()) return;

    const q = quizData[currentQuestion];
    const userAnswer = getUserAnswer();
    const correctAnswer = getCorrectAnswer(q);
    let isCorrect = false;

    console.log("User Answer:", userAnswer);
    console.log("Correct Answer:", correctAnswer);

    if (q.type === "mcq" || q.type === "truefalse" || q.type === "blank") {
        isCorrect = userAnswer === correctAnswer;
    } else if (q.type === "short") {
        // Basic string comparison for short answers (can be improved)
        isCorrect = userAnswer === correctAnswer;
    }

    if (isCorrect) {
        score++;
        console.log("Score:", score);
    }

    provideFeedback(isCorrect, q.correctAnswer); // Use q.correctAnswer for display
}

function provideFeedback(isCorrect, correctAnswer) {
    let feedback = "";
    if (isCorrect) {
        feedback = "<span style='color: green;'>Correct!</span>";
    } else {
        feedback = `<span style='color: red;'>Incorrect.</span> The correct answer is: ${correctAnswer}`;
    }
    questionElement.innerHTML += `<br>${feedback}`; // Append feedback to question
}


function showScore() {
    localStorage.setItem(currentLesson, "done");
    scoreElement.textContent = `${score} / ${quizData.length}`;
    showPage("score");
}

// --- Helper/Utility Functions ---

function isValidQuestionState() {
    if (!quizData || quizData.length === 0 || currentQuestion >= quizData.length) {
        console.error("Invalid quiz data or question index");
        return false;
    }
    return true;
}

function resetQuizState() {
    currentQuestion = 0;
    score = 0;
}

function getUserAnswer() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    if (selectedOption) {
        return selectedOption.value.trim().toLowerCase();
    } else {
        const textInput = document.querySelector('input[name="quiz-option"]');
        if (textInput) {
            return textInput ? textInput.value.trim().toLowerCase() : "";
        }
    }
    return ""; // Return an empty string if no answer is selected
}

function getCorrectAnswer(question) {
    if (question.type === "mcq") {
        return question.options[question.answer].toLowerCase();
    } else if (question.type === "truefalse") {
        return question.answer.toString(); // Convert boolean to string
    } else {
        return question.answer ? question.answer.toLowerCase() : ""; // Return "" if no answer
    }
}

function displayMCQOptions(options) {
    options.forEach((opt, index) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="quiz-option" value="${opt.toLowerCase()}" id="option${index}"> ${opt}`;
        optionsElement.appendChild(label);
    });
}

function displayTrueFalseOptions() {
    ["True", "False"].forEach(opt => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="quiz-option" value="${opt.toLowerCase()}"> ${opt}`;
        optionsElement.appendChild(label);
    });
}

function displayTextInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "quiz-option";
    input.placeholder = "Type your answer...";
    optionsElement.appendChild(input);
}

// --- User Interaction Handlers ---

function submitCode() {
    const code = codeInputElement.value.trim().toUpperCase();
    errorMessageElement.textContent = "";

    const lessonKey = Object.keys(lessonCodes).find(key =>
        code === lessonCodes[key].take || code === lessonCodes[key].retake
    );

    if (!lessonKey) {
        errorMessageElement.textContent = "Invalid code.";
        return;
    }

    const saved = localStorage.getItem(lessonKey);
    if (saved === "done" && code !== lessonCodes[lessonKey].retake) {
        errorMessageElement.textContent = "Retake code required.";
        return;
    }

    currentLesson = lessonKey;
    loadQuiz(lessonKey, code);
}

function nextQuestion() {
    console.log("--- Next Button Clicked ---");
    checkAnswer();
    console.log("Current Question (before increment):", currentQuestion);
    currentQuestion++;
    console.log("Current Question (after increment):", currentQuestion);

    if (currentQuestion < quizData.length) {
        showQuestion();
    } else {
        showScore();
    }
}

function retakeQuiz() {
    codeInputElement.value = "";
    showPage("code");
}

// --- Initial Page Load ---
showPage("welcome");
