/**
 * Displays the score on the page.
 * @param {number} score - The number of correct answers.
 * @param {number} totalQuestions - The total number of questions.
 */
function displayScore(score, totalQuestions) {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = `Bạn đã đạt ${score} / ${totalQuestions} điểm.`;

    scoreDisplay.classList.remove('text-success', 'text-warning', 'text-danger');
    if (score === totalQuestions) {
        scoreDisplay.classList.add('text-success');
    } else if (score >= totalQuestions / 2) {
        scoreDisplay.classList.add('text-warning');
    } else {
        scoreDisplay.classList.add('text-danger');
    }
    scoreDisplay.style.display = 'block'; // Show the score display
    scoreDisplay.scrollIntoIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Main function to render detailed solutions based on the exercise type.
 * @param {object} questionsData - The specific questions data for the current exercise.
 * @param {string} exerciseType - A string identifying the type of exercise (e.g., 'fillInBlanks', 'multipleChoice', 'clickableWords', 'rewriteSentence').
 */
function renderDetailedSolution(questionsData, exerciseType) {
    const solutionListDiv = document.querySelector('#detailedSolution .solution-list');
    solutionListDiv.innerHTML = ''; // Clear previous solutions
    document.getElementById('detailedSolution').style.display = 'block'; // Show solution section

    Object.keys(questionsData).forEach(qId => {
        // Bỏ qua các ID kết thúc bằng '_b' ở đây nếu chúng được xử lý cùng với câu hỏi chính.
        // Điều này cần được kiểm soát cẩn thận tùy thuộc vào cách bạn cấu trúc questionsData.
        // Với các dạng bài như Điền từ hoặc Viết lại câu có nhiều chỗ trống,
        // qID_b sẽ được xử lý khi qID chính được render.
        if (qId.endsWith('_b') && (exerciseType === 'fillInBlanks' || exerciseType === 'rewriteSentence')) {
             return;
        }

        const questionInfo = questionsData[qId];
        const solutionItem = document.createElement('div');
        solutionItem.classList.add('solution-item');

        const questionNumber = qId.substring(1); // Lấy số thứ tự câu hỏi
        const questionTextSolutionDiv = document.createElement('div');
        questionTextSolutionDiv.classList.add('question-text-solution');

        let fullTextHtml = '';
        let explanationHtml = '';
        let translationHtml = '';

        switch (exerciseType) {
            case 'fillInBlanks':
            case 'rewriteSentence': // Viết lại câu cũng dùng logic render tương tự điền từ
                if (questionInfo.correct_answer_parts) { // Multiple blanks
                    fullTextHtml = `${questionNumber}. ${questionInfo.text_parts[0]} <span class="correct-answer-text">${questionInfo.correct_answer_parts[0]}</span> ${questionInfo.text_parts[1]} <span class="correct-answer-text">${questionInfo.correct_answer_parts[1]}</span> ${questionInfo.text_parts[2] || ''}`;
                } else { // Single blank
                    fullTextHtml = `${questionNumber}. ${questionInfo.text_parts[0]} <span class="correct-answer-text">${questionInfo.correct_answer}</span> ${questionInfo.text_parts[1] || ''}`;
                }
                
                // Hiển thị câu gốc cho dạng viết lại câu nếu có
                if (questionInfo.prompt && exerciseType === 'rewriteSentence') {
                    fullTextHtml = `<strong>Câu gốc:</strong> ${questionInfo.prompt}<br>` + `<strong>Viết lại:</strong> ` + fullTextHtml;
                }

                explanationHtml = `<strong>Giải thích:</strong> ${questionInfo.explanation || 'Không có giải thích.'}`;
                if (questionInfo.grammar_note) { // Thêm ghi chú ngữ pháp nếu có
                    explanationHtml += `<br><strong>Ghi chú ngữ pháp:</strong> ${questionInfo.grammar_note}`;
                }
                translationHtml = `<strong>Dịch:</strong> ${questionInfo.translation || 'Không có bản dịch.'}`;
                break;

            case 'multipleChoice':
                fullTextHtml = `${questionNumber}. ${questionInfo.question}`;
                
                const optionsDiv = document.createElement('div');
                optionsDiv.classList.add('options-solution');
                questionInfo.options.forEach(option => {
                    const optionP = document.createElement('p');
                    optionP.classList.add('option-text-solution');
                    if (option.isCorrect) {
                        optionP.innerHTML = `<span class="correct-answer-text">${option.text}</span>`;
                    } else {
                        optionP.textContent = option.text;
                    }
                    optionP.innerHTML += ` <span class="grammar-explanation">(${option.rationale})</span>`;
                    optionsDiv.appendChild(optionP);
                });
                solutionItem.appendChild(optionsDiv);
                
                explanationHtml = `<strong>Giải thích:</strong> ${questionInfo.explanation || 'Không có giải thích.'}`;
                translationHtml = `<strong>Dịch:</strong> ${questionInfo.translation || 'Không có bản dịch.'}`;
                break;

            case 'clickableWords':
                fullTextHtml = `${questionNumber}. ${questionInfo.text_parts[0]} <span class="correct-answer-text">${questionInfo.correct_answer}</span> ${questionInfo.text_parts[1] || ''}`;
                explanationHtml = `<strong>Giải thích:</strong> ${questionInfo.explanation || 'Không có giải thích.'}`;
                translationHtml = `<strong>Dịch:</strong> ${questionInfo.translation || 'Không có bản dịch.'}`;
                break;

            default:
                console.warn(`Unknown exercise type: ${exerciseType}. Cannot render detailed solution.`);
                return;
        }

        questionTextSolutionDiv.innerHTML = fullTextHtml;
        solutionItem.appendChild(questionTextSolutionDiv);

        if (explanationHtml) {
            const grammarExplanationDiv = document.createElement('div');
            grammarExplanationDiv.classList.add('grammar-explanation');
            grammarExplanationDiv.innerHTML = explanationHtml;
            solutionItem.appendChild(grammarExplanationDiv);
        }

        if (translationHtml) {
            const translationDiv = document.createElement('div');
            translationDiv.classList.add('translation');
            translationDiv.innerHTML = translationHtml;
            solutionItem.appendChild(translationDiv);
        }

        solutionListDiv.appendChild(solutionItem);
    });
}

/**
 * Resets the exercise by clearing input fields, hiding feedback, score, and solutions.
 * This function is generic and should work for various input types.
 * It attempts to reset all forms and remove common feedback classes.
 */
function resetExercise() {
    // Reset tất cả các form trên trang
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.reset(); // Reset tất cả các trường trong form đó
    });

    // Xóa các class feedback và selected từ tất cả các phần tử có thể có
    const allElementsWithFeedback = document.querySelectorAll(
        'input, select, textarea, .clickable-word, label, .form-check-input' // Thêm .form-check-input cho radio/checkbox
    );
    allElementsWithFeedback.forEach(el => {
        el.classList.remove('is-correct', 'is-incorrect', 'selected', 'correct-selection', 'incorrect-selection', 'text-success', 'text-danger', 'fw-bold');
    });

    const feedbackIcons = document.querySelectorAll('.feedback-icon');
    feedbackIcons.forEach(icon => {
        icon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
        icon.style.display = 'none'; // Ẩn biểu tượng feedback
    });

    // Ẩn và xóa nội dung hiển thị điểm và lời giải chi tiết
    document.getElementById('scoreDisplay').textContent = '';
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('detailedSolution').style.display = 'none';
    document.querySelector('#detailedSolution .solution-list').innerHTML = '';
}