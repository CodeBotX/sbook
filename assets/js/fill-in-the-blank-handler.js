/**
 * Hàm trợ giúp để thoát các ký tự đặc biệt trong biểu thức chính quy.
 * @param {string} string - Chuỗi cần thoát.
 * @returns {string} Chuỗi đã được thoát.
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Xử lý logic chấm điểm và tạo HTML giải pháp cho dạng bài "Điền vào chỗ trống".
 * @param {string} qId - ID của câu hỏi.
 * @param {object} questionInfo - Dữ liệu của câu hỏi từ questionsData.
 * @param {HTMLElement} formElement - Phần tử form chứa câu hỏi.
 * @param {HTMLElement} questionItemElement - Phần tử .question-item bao quanh câu hỏi.
 * @param {object} solutionHtmlParts - Đối tượng để lưu trữ các phần HTML của giải pháp (sẽ được điền vào).
 * @returns {boolean} True nếu câu trả lời đúng, False nếu sai.
 */
function handleFillInTheBlank(qId, questionInfo, formElement, questionItemElement, solutionHtmlParts) {
    let isCorrectForQuestion = true;

    let inputElementsInQuestion = [];
    if (questionInfo.correct_answer_parts && Array.isArray(questionInfo.correct_answer_parts)) {
        for (let i = 0; i < questionInfo.correct_answer_parts.length; i++) {
            const suffix = i === 0 ? '' : (i === 1 ? 'b' : (i === 2 ? 'c' : `p${i}`));
            const inputEl = document.getElementById(`${qId}${suffix}`);
            if (inputEl) inputElementsInQuestion.push(inputEl);
        }
    } else {
        const inputEl = document.getElementById(qId);
        if (inputEl) inputElementsInQuestion.push(inputEl);
    }

    if (inputElementsInQuestion.length === 0) {
        console.warn(`No input elements found for fill_in_the_blank question ID: ${qId}`);
        isCorrectForQuestion = false;
    } else {
        if (questionInfo.correct_answer_parts && Array.isArray(questionInfo.correct_answer_parts)) {
            inputElementsInQuestion.forEach((inputElement, index) => {
                const userAnswer = inputElement.value.trim().toLowerCase();
                const correctAnswer = (questionInfo.correct_answer_parts[index] || '').toLowerCase();

                if (userAnswer === correctAnswer) {
                    inputElement.classList.add('is-correct');
                } else {
                    inputElement.classList.add('is-incorrect');
                    isCorrectForQuestion = false;
                }
            });
        } else if (questionInfo.correct_answer) {
            const inputElement = inputElementsInQuestion[0];
            const userAnswer = inputElement.value.trim().toLowerCase();
            const correctAnswer = questionInfo.correct_answer.toLowerCase();

            if (userAnswer === correctAnswer) {
                inputElement.classList.add('is-correct');
            } else {
                inputElement.classList.add('is-incorrect');
                isCorrectForQuestion = false;
            }
        } else {
            const inputElement = inputElementsInQuestion[0];
            if (inputElement && inputElement.value.trim() !== '') {
                inputElement.classList.add('is-correct');
            } else {
                inputElement.classList.add('is-incorrect');
                isCorrectForQuestion = false;
            }
        }
    }

    // --- Tạo HTML giải pháp cho dạng điền vào chỗ trống ---
    let fullTextHtml = '';
    if (questionInfo.fullSentence) {
        let correctAnswerForFullSentence = questionInfo.correct_answer || (questionInfo.correct_answer_parts ? questionInfo.correct_answer_parts.join(' ') : '');
        const escapedCorrectAnswer = escapeRegExp(correctAnswerForFullSentence);
        const regex = new RegExp(escapedCorrectAnswer, 'gi');
        fullTextHtml = questionInfo.fullSentence.replace(
            regex,
            `<span class="correct-answer-text">${correctAnswerForFullSentence}</span>`
        );
    } else if (questionInfo.text_parts && Array.isArray(questionInfo.text_parts)) {
        let blankIndex = 0;
        for (let i = 0; i < questionInfo.text_parts.length; i++) {
            fullTextHtml += questionInfo.text_parts[i];
            if (blankIndex < (questionInfo.correct_answer_parts ? questionInfo.correct_answer_parts.length : 0)) {
                fullTextHtml += `<span class="correct-answer-text">${questionInfo.correct_answer_parts[blankIndex]}</span>`;
                blankIndex++;
            }
        }
    } else if (questionInfo.correct_answer) {
        let questionText = questionInfo.question_text || questionItemElement?.querySelector('.question-text')?.innerText || '';
        questionText = questionText.replace(/___+|\[___\]|\s*<input[^>]*>\s*/g, `<span class="correct-answer-text">${questionInfo.correct_answer}</span>`);
        fullTextHtml += questionText;
    } else {
        fullTextHtml += questionInfo.question_text || questionItemElement?.querySelector('.question-text')?.innerText || 'Không có câu hỏi gốc.';
        fullTextHtml += `<br><em>Đáp án mẫu: <span class="correct-answer-text">${questionInfo.correct_answer || 'N/A'}</span></em>`;
    }

    solutionHtmlParts.questionText = fullTextHtml;
    solutionHtmlParts.explanation = questionInfo.explanation || 'Không có giải thích.';
    solutionHtmlParts.translation = questionInfo.translation || 'Không có bản dịch.';
    solutionHtmlParts.grammar_note = questionInfo.grammar_note; // Thêm grammar_note vào đây

    return isCorrectForQuestion;
}