/**
 * Normalizes a string by converting to lowercase, trimming whitespace,
 * and replacing multiple spaces with a single space.
 * @param {string} inputString - The string to normalize.
 * @returns {string} The normalized string.
 */
function normalizeAnswer(inputString) {
    if (typeof inputString !== 'string') {
        return '';
    }
    return inputString.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Hàm displayFeedback đã được loại bỏ khỏi đây

/**
 * Creates and appends a detailed solution item to the solution list.
 * This function is designed to be reusable across different exercise types,
 * assuming a similar structure for displaying solutions.
 * @param {number} questionNumber - The sequential number of the question.
 * @param {object} questionData - The data object for the specific question, containing originalText, fixedTextTemplate, correctAnswers, explanation, and grammarNote.
 * @param {string} userAnswer - The user's submitted answer for this question.
 */
function addSolutionItem(questionNumber, questionData, userAnswer) {
    const solutionListDiv = document.querySelector('#detailedSolution .solution-list');
    if (!solutionListDiv) {
        console.error("Solution list div not found.");
        return;
    }

    const solutionItem = document.createElement('div');
    solutionItem.classList.add('solution-item');

    // Original question text with bold for the wrong part
    const originalQuestionDiv = document.createElement('div');
    originalQuestionDiv.classList.add('original-question');
    originalQuestionDiv.innerHTML = `<strong>${questionNumber}. Câu gốc:</strong> ${questionData.originalText}`;
    solutionItem.appendChild(originalQuestionDiv);

    // Correct sentence with highlighted answer
    const correctSentenceDiv = document.createElement('div');
    correctSentenceDiv.classList.add('correct-sentence');
    // We use correctAnswers[0] as the primary display answer for the template
    correctSentenceDiv.innerHTML = `<strong>Câu đúng:</strong> ${questionData.fixedTextTemplate.replace('{answer}', questionData.correctAnswers[0])}`;
    solutionItem.appendChild(correctSentenceDiv);

    // Explanation and grammar note
    const explanationDiv = document.createElement('div');
    explanationDiv.classList.add('explanation');
    explanationDiv.innerHTML = `<strong>Giải thích:</strong> ${questionData.explanation}<br><em>${questionData.grammarNote}</em>`;
    solutionItem.appendChild(explanationDiv);

    solutionListDiv.appendChild(solutionItem);
}

/**
 * Displays the score and applies appropriate styling based on performance.
 * @param {number} score - The user's score.
 * @param {number} totalQuestions - The total number of questions.
 */
function displayScore(score, totalQuestions) {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) {
        console.error("Score display element not found.");
        return;
    }

    scoreDisplay.textContent = `Bạn đã đạt ${score} / ${totalQuestions} điểm.`;
    scoreDisplay.classList.remove('text-success', 'text-warning', 'text-danger');

    if (score === totalQuestions) {
        scoreDisplay.classList.add('text-success');
    } else if (score >= totalQuestions / 2) {
        scoreDisplay.classList.add('text-warning');
    } else {
        scoreDisplay.classList.add('text-danger');
    }
    scoreDisplay.style.display = 'block'; // Ensure score is visible
    scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Automatically adjusts input width based on content length.
 * This prevents text from being hidden when users type long answers.
 * @param {HTMLInputElement} input - The input element to adjust.
 */
function adjustInputWidth(input) {
    // Create a temporary span to measure text width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.fontSize = window.getComputedStyle(input).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily;
    tempSpan.style.fontWeight = window.getComputedStyle(input).fontWeight;
    tempSpan.style.letterSpacing = window.getComputedStyle(input).letterSpacing;
    
    // Add some padding to account for input padding
    const padding = 4; // 2px on each side
    tempSpan.textContent = input.value || input.placeholder || '';
    
    document.body.appendChild(tempSpan);
    const textWidth = tempSpan.offsetWidth + padding;
    document.body.removeChild(tempSpan);
    
    // Calculate new width with constraints
    const minWidth = parseInt(window.getComputedStyle(input).minWidth) || 40;
    const maxWidth = parseInt(window.getComputedStyle(input).maxWidth) || 80;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, textWidth));
    
    input.style.width = newWidth + 'px';
}

/**
 * Initializes auto-resize functionality for all answer inputs.
 * This should be called when the page loads or when new inputs are added.
 */
function initializeAutoResizeInputs() {
    const inputs = document.querySelectorAll('.answer-input');
    inputs.forEach(input => {
        // Set initial width
        adjustInputWidth(input);
        
        // Add event listeners for input changes
        input.addEventListener('input', () => adjustInputWidth(input));
        input.addEventListener('focus', () => adjustInputWidth(input));
        input.addEventListener('blur', () => adjustInputWidth(input));
    });
}

/**
 * Resets the state of the exercise by clearing inputs, hiding feedback, score, and solutions.
 * This function is generic and can be used for any exercise type.
 */
function resetExercise() {
    const inputElements = document.querySelectorAll('.answer-input');
    inputElements.forEach(input => {
        input.value = '';
        input.classList.remove('is-valid', 'is-invalid');
        // Reset input width to minimum after clearing
        adjustInputWidth(input);
    });

    const feedbackIcons = document.querySelectorAll('.feedback-icon');
    feedbackIcons.forEach(icon => {
        icon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
        icon.style.display = 'none';
    });

    document.getElementById('scoreDisplay').textContent = '';
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('detailedSolution').style.display = 'none';
    document.querySelector('#detailedSolution .solution-list').innerHTML = '';
}

// Initialize auto-resize functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoResizeInputs();
});