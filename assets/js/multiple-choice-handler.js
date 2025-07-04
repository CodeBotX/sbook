/**
 * Xử lý logic chấm điểm và tạo HTML giải pháp cho dạng bài "Trắc nghiệm".
 * @param {string} qId - ID của câu hỏi.
 * @param {object} questionInfo - Dữ liệu của câu hỏi từ questionsData.
 * @param {HTMLElement} formElement - Phần tử form chứa câu hỏi.
 * @param {HTMLElement} questionItemElement - Phần tử .question-item bao quanh câu hỏi.
 * @param {object} solutionHtmlParts - Đối tượng để lưu trữ các phần HTML của giải pháp (sẽ được điền vào).
 * @returns {boolean} True nếu câu trả lời đúng, False nếu sai.
 */
function handleMultipleChoice(qId, questionInfo, formElement, questionItemElement, solutionHtmlParts) {
    let isCorrectForQuestion = false; // Mặc định là sai cho trắc nghiệm
    const radioButtons = document.querySelectorAll(`input[name="${qId}"]`);
    let selectedOptionValue = null;

    radioButtons.forEach(radio => {
        const parentOptionLabel = radio.closest('.option-label');
        if (radio.checked) {
            selectedOptionValue = radio.value;
            if (selectedOptionValue === questionInfo.correct_option_value) {
                isCorrectForQuestion = true;
                if (parentOptionLabel) parentOptionLabel.classList.add('is-correct');
            } else {
                isCorrectForQuestion = false;
                if (parentOptionLabel) parentOptionLabel.classList.add('is-incorrect');
            }
        }
    });

    // Nếu người dùng chọn sai, đánh dấu đáp án đúng
    if (!isCorrectForQuestion && questionInfo.correct_option_value) {
        const correctRadio = document.querySelector(`input[name="${qId}"][value="${questionInfo.correct_option_value}"]`);
        if (correctRadio) {
            correctRadio.closest('.option-label')?.classList.add('correct-but-not-selected');
        }
    }

    // --- Tạo HTML giải pháp cho dạng trắc nghiệm ---
    let fullTextHtml = '';
    
    // Sử dụng question_text_original nếu có, hoặc tạo từ options
    if (questionInfo.question_text_original) {
        fullTextHtml = questionInfo.question_text_original;
    } else {
        // Tạo câu hỏi từ options nếu không có question_text_original
        fullTextHtml = questionInfo.question_text || questionItemElement?.querySelector('.question-text')?.innerHTML || '';
    }

    // Thêm đáp án đúng vào câu hỏi
    if (questionInfo.correct_option_value && questionInfo.options) {
        const correctOption = questionInfo.options.find(option => option.value === questionInfo.correct_option_value);
        if (correctOption) {
            // Thay thế placeholder _____ bằng đáp án đúng
            fullTextHtml = fullTextHtml.replace('_____', `<span class="correct-answer-text">${correctOption.text}</span>`);
            // Nếu không có placeholder, thêm đáp án đúng vào cuối
            if (!fullTextHtml.includes('correct-answer-text')) {
                fullTextHtml += ` <span class="correct-answer-text">(${correctOption.value}. ${correctOption.text})</span>`;
            }
        }
    }

    // Thêm thông tin về đáp án đúng nếu có fullSentence
    if (questionInfo.fullSentence) {
        fullTextHtml += `<br><small><strong>Đáp án đúng:</strong> ${questionInfo.fullSentence}</small>`;
    }

    solutionHtmlParts.questionText = fullTextHtml;
    solutionHtmlParts.explanation = questionInfo.explanation || 'Không có giải thích.';
    solutionHtmlParts.translation = questionInfo.translation || 'Không có bản dịch.';
    solutionHtmlParts.grammar_note = questionInfo.grammar_note; // Thêm grammar_note vào đây

    return isCorrectForQuestion;
}