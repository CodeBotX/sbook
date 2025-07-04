/**
 * Gửi câu trả lời của người dùng, tính điểm, cung cấp phản hồi,
 * và hiển thị giải pháp chi tiết cho một bài tập cụ thể.
 * @param {string} formId - ID của form chứa các câu hỏi.
 * @param {string} scoreDisplayId - ID của phần tử hiển thị điểm.
 * @param {string} solutionSectionId - ID của phần tử hiển thị giải pháp chi tiết.
 */
function submitAnswersLogic(formId, scoreDisplayId, solutionSectionId) {
    let score = 0;
    const formElement = document.getElementById(formId);
    if (!formElement) {
        console.error('Form element not found:', formId);
        return;
    }

    // Lọc ra các câu hỏi chính có trong form hiện tại
    const questionKeysInThisForm = Object.keys(questionsData).filter(qId => {
        const inputElement = formElement.querySelector(`#${qId}`); // cho input text
        const radioGroup = formElement.querySelector(`input[name="${qId}"]`); // cho radio
        const hasElement = inputElement !== null || radioGroup !== null;
        console.log(`Question ${qId}: inputElement=${inputElement}, radioGroup=${radioGroup}, hasElement=${hasElement}`);
        return hasElement;
    });

    const totalQuestions = questionKeysInThisForm.length;
    console.log(`Total questions found: ${totalQuestions}`);
    console.log(`Question keys: ${questionKeysInThisForm.join(', ')}`);

    const solutionListDiv = document.querySelector(`#${solutionSectionId} .solution-list`);
    solutionListDiv.innerHTML = '';
    document.getElementById(solutionSectionId).style.display = 'block';

    questionKeysInThisForm.forEach(qId => {
        const questionInfo = questionsData[qId];

        if (!questionInfo) {
            console.warn(`Question data not found for ID: ${qId}`);
            const solutionItem = document.createElement('div');
            solutionItem.classList.add('solution-item');
            solutionItem.innerHTML = `<div class="question-text-solution">Câu hỏi ID "${qId}" không tìm thấy dữ liệu.</div>`;
            solutionListDiv.appendChild(solutionItem);
            return;
        }

        const questionItemElement = formElement.querySelector(`[data-question-id="${qId}"]`);
        console.log(`Question item element for ${qId}:`, questionItemElement);
        // Tìm feedback icon dựa trên quy tắc đặt tên (ví dụ: qD1 -> iconD1, q1a -> icon1)
        const iconNumberMatch = qId.match(/\d+/);
        const iconPrefixMatch = qId.match(/^[a-zA-Z]+/);
        const iconId = `icon${iconPrefixMatch ? iconPrefixMatch[0].toUpperCase() : ''}${iconNumberMatch ? iconNumberMatch[0] : ''}`;
        const feedbackIcon = document.getElementById(iconId);

        // Xóa các lớp phản hồi cũ trên tất cả các input/option của câu hỏi này
        if (questionItemElement) {
            questionItemElement.querySelectorAll('input').forEach(input => {
                if (input.type === 'text') {
                    input.classList.remove('is-correct', 'is-incorrect');
                } else if (input.type === 'radio') {
                    input.closest('.form-check')?.classList.remove('is-correct', 'is-incorrect', 'correct-but-not-selected');
                    input.closest('.option-label')?.classList.remove('is-correct', 'is-incorrect', 'correct-but-not-selected');
                }
            });
        }

        let isCorrectForQuestion = true;
        const solutionHtmlParts = {
            questionText: '',
            explanation: '',
            translation: '',
            grammar_note: ''
        };

        // Gọi handler chuyên biệt dựa trên dạng bài tập
        if (questionInfo.type === 'fill_in_the_blank') {
            isCorrectForQuestion = handleFillInTheBlank(qId, questionInfo, formElement, questionItemElement, solutionHtmlParts);
        } else if (questionInfo.type === 'multiple_choice') {
            isCorrectForQuestion = handleMultipleChoice(qId, questionInfo, formElement, questionItemElement, solutionHtmlParts);
        } else {
            console.warn(`Unknown question type for ID: ${qId}. Please define 'type' in questionsData or add a handler.`);
            isCorrectForQuestion = false;
            solutionHtmlParts.questionText = 'Không hỗ trợ dạng câu hỏi này.';
            solutionHtmlParts.explanation = 'Không có giải thích.';
            solutionHtmlParts.translation = 'Không có bản dịch.';
        }

        if (isCorrectForQuestion) {
            score++;
        }

        if (feedbackIcon) {
            feedbackIcon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
            if (isCorrectForQuestion) {
                feedbackIcon.classList.add('fa-check-circle', 'text-success');
            } else {
                feedbackIcon.classList.add('fa-times-circle', 'text-danger');
            }
            feedbackIcon.style.display = 'inline-block';
        }

        // --- Logic hiển thị giải pháp chi tiết chung (sử dụng dữ liệu từ handler) ---
        const solutionItem = document.createElement('div');
        solutionItem.classList.add('solution-item');

        const questionNumberMatch = qId.match(/\d+/);
        const questionNumber = questionNumberMatch ? questionNumberMatch[0] : '';

        const questionTextSolutionDiv = document.createElement('div');
        questionTextSolutionDiv.classList.add('question-text-solution');
        questionTextSolutionDiv.innerHTML = `${questionNumber}. ` + solutionHtmlParts.questionText;
        solutionItem.appendChild(questionTextSolutionDiv);

        const grammarExplanationDiv = document.createElement('div');
        grammarExplanationDiv.classList.add('grammar-explanation');
        grammarExplanationDiv.innerHTML = `<strong>Giải thích ngữ pháp & ngữ cảnh:</strong> ${solutionHtmlParts.explanation}`;
        if (solutionHtmlParts.grammar_note) {
            grammarExplanationDiv.innerHTML += `<br><em>${solutionHtmlParts.grammar_note}</em>`;
        }
        solutionItem.appendChild(grammarExplanationDiv);

        const translationDiv = document.createElement('div');
        translationDiv.classList.add('translation');
        translationDiv.innerHTML = `<strong>Dịch:</strong> ${solutionHtmlParts.translation}`;
        solutionItem.appendChild(translationDiv);

        solutionListDiv.appendChild(solutionItem);
    });

    // --- Hiển thị điểm số chung ---
    const scoreDisplay = document.getElementById(scoreDisplayId);
    scoreDisplay.textContent = `Bạn đã đạt ${score} / ${totalQuestions} điểm.`;

    scoreDisplay.classList.remove('text-success', 'text-warning', 'text-danger');
    if (score === totalQuestions) {
        scoreDisplay.classList.add('text-success');
    } else if (score >= totalQuestions / 2) {
        scoreDisplay.classList.add('text-warning');
    } else {
        scoreDisplay.classList.add('text-danger');
    }
    scoreDisplay.style.display = 'block';

    scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Đặt lại bài tập bằng cách xóa các trường nhập, ẩn phản hồi, điểm số và giải pháp.
 * @param {string} formId - ID của form chứa các câu hỏi.
 * @param {string} scoreDisplayId - ID của phần tử hiển thị điểm.
 * @param {string} solutionSectionId - ID của phần tử hiển thị giải pháp chi tiết.
 */
function resetExerciseLogic(formId, scoreDisplayId, solutionSectionId) {
    const formElement = document.getElementById(formId);
    if (!formElement) {
        console.error('Form element not found:', formId);
        return;
    }

    formElement.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
        input.classList.remove('is-correct', 'is-incorrect');
    });

    formElement.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
        radio.closest('.form-check')?.classList.remove('is-correct', 'is-incorrect', 'correct-but-not-selected');
        radio.closest('.option-label')?.classList.remove('is-correct', 'is-incorrect', 'correct-but-not-selected');
    });

    const feedbackIcons = formElement.querySelectorAll('.feedback-icon');
    feedbackIcons.forEach(icon => {
        icon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
        icon.style.display = 'none';
    });

    document.getElementById(scoreDisplayId).textContent = '';
    document.getElementById(scoreDisplayId).style.display = 'none';
    document.getElementById(solutionSectionId).style.display = 'none';
    document.querySelector(`#${solutionSectionId} .solution-list`).innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}