
/**
 * Biến toàn cục để lưu trữ dữ liệu câu hỏi.
 * Biến này sẽ được GÁN LẠI trong mỗi file HTML cụ thể hoặc file JS của từng bài tập.
 */
let questionsData = {}; // Vẫn giữ biến này để setQuestionsData có thể dùng

/**
 * Hàm để thiết lập dữ liệu câu hỏi cho bài tập hiện tại.
 * Các file HTML hoặc JS riêng của bài tập sẽ gọi hàm này.
 * @param {object} data - Đối tượng chứa dữ liệu câu hỏi (correct_answer, text_parts, explanation, v.v.).
 */
function setQuestionsData(data) {
    questionsData = data;
}

/**
 * Gửi câu trả lời của người dùng, tính điểm, cung cấp phản hồi,
 * và hiển thị giải pháp chi tiết cho một bài tập cụ thể.
 * @param {string} formId - ID của form chứa các câu hỏi (e.g., 'fillInTheBlanksFormD', 'fillInTheBlanksFormE').
 * @param {string} scoreDisplayId - ID của phần tử hiển thị điểm (e.g., 'scoreDisplayD', 'scoreDisplayE').
 * @param {string} solutionSectionId - ID của phần tử hiển thị giải pháp chi tiết (e.g., 'detailedSolutionD', 'detailedSolutionE').
 */
function submitAnswersLogic(formId, scoreDisplayId, solutionSectionId) {
    let score = 0;
    const formElement = document.getElementById(formId);
    if (!formElement) {
        console.error('Form element not found:', formId);
        return;
    }

    // Lọc ra các câu hỏi chính (không phải là '_b' hoặc các hậu tố khác)
    // Dựa vào các ID trong questionsData để xác định các câu hỏi chính của bài tập này
    const questionKeysInThisForm = Object.keys(questionsData).filter(qId => {
        // Lấy tất cả các input trong form hiện tại
        const inputElement = formElement.querySelector(`#${qId}`);
        return inputElement !== null; // Chỉ đếm các câu hỏi có input tương ứng trong form này
    });

    // Để tính tổng số câu hỏi, chúng ta cần đếm các ID chính mà không bị trùng lặp
    // Đối với qD1, qD2, qE1, qE2, v.v., chúng là các ID chính.
    // Nếu có q1a, q1b, thì q1a là chính.
    const totalQuestions = questionKeysInThisForm.length;


    const solutionListDiv = document.querySelector(`#${solutionSectionId} .solution-list`);
    solutionListDiv.innerHTML = ''; // Xóa các giải pháp trước đó
    document.getElementById(solutionSectionId).style.display = 'block'; // Hiển thị phần giải pháp

    // Lặp qua từng câu hỏi trong bộ dữ liệu questionsData hiện tại
    questionKeysInThisForm.forEach(qId => {
        const questionInfo = questionsData[qId];
        // Tìm phần tử question-item chứa các input của câu hỏi này
        const questionItemElement = document.getElementById(qId)?.closest('.question-item');
        
        // Lấy ID icon phản hồi. Nếu ID câu hỏi là qD1, icon là iconD1. Nếu là q1a, icon là icon1.
        // Cần một regex linh hoạt hơn để lấy số từ ID
        const iconNumberMatch = qId.match(/\d+/);
        const iconPrefixMatch = qId.match(/^[a-zA-Z]+/);
        const iconId = `icon${iconPrefixMatch ? iconPrefixMatch[0].toUpperCase() : ''}${iconNumberMatch ? iconNumberMatch[0] : ''}`;
        const feedbackIcon = document.getElementById(iconId);

        let isCorrectForQuestion = true; // Giả định đúng cho đến khi có bằng chứng sai
        
        // Lấy tất cả các input liên quan đến câu hỏi này (ví dụ: q1a, q1b)
        let inputElementsInQuestion = [];
        if (questionInfo.correct_answer_parts) {
            // Đối với câu hỏi có nhiều chỗ trống, tìm các input theo ID cụ thể
            for (let i = 0; i < questionInfo.correct_answer_parts.length; i++) {
                const inputId = `${qId}${i === 0 ? '' : (i === 1 ? 'b' : `b${i}`)}`; // q1a, q1b, q1ab2... (adjust if needed)
                const inputEl = document.getElementById(inputId);
                if (inputEl) inputElementsInQuestion.push(inputEl);
            }
        } else {
            // Đối với câu hỏi một chỗ trống
            const inputEl = document.getElementById(qId);
            if (inputEl) inputElementsInQuestion.push(inputEl);
        }

        if (inputElementsInQuestion.length === 0) {
            console.warn(`No input elements found for question ID: ${qId}`);
            isCorrectForQuestion = false;
        }

        // Xử lý các câu hỏi có nhiều chỗ trống hoặc một chỗ trống
        if (questionInfo.correct_answer_parts) {
            // Đây là câu hỏi nhiều chỗ trống
            if (inputElementsInQuestion.length !== questionInfo.correct_answer_parts.length) {
                console.warn(`Mismatch in input elements count for question ${qId}. Expected ${questionInfo.correct_answer_parts.length}, found ${inputElementsInQuestion.length}`);
                isCorrectForQuestion = false;
            } else {
                inputElementsInQuestion.forEach((inputElement, index) => {
                    inputElement.classList.remove('is-correct', 'is-incorrect'); // Đặt lại các lớp
                    const userAnswer = inputElement.value.trim().toLowerCase();
                    const correctAnswer = questionInfo.correct_answer_parts[index].toLowerCase();
    
                    if (userAnswer === correctAnswer) {
                        inputElement.classList.add('is-correct');
                    } else {
                        inputElement.classList.add('is-incorrect');
                        isCorrectForQuestion = false; // Đánh dấu toàn bộ câu hỏi là sai
                    }
                });
            }
        } else if (questionInfo.correct_answer) {
            // Đây là câu hỏi một chỗ trống
            const inputElement = inputElementsInQuestion[0]; // Lấy input đầu tiên
            inputElement.classList.remove('is-correct', 'is-incorrect'); // Đặt lại các lớp
            const userAnswer = inputElement.value.trim().toLowerCase();
            const correctAnswer = questionInfo.correct_answer.toLowerCase();
            
            if (userAnswer === correctAnswer) {
                inputElement.classList.add('is-correct');
            } else {
                inputElement.classList.add('is-incorrect');
                isCorrectForQuestion = false; // Đánh dấu toàn bộ câu hỏi là sai
            }
        } else {
            // Trường hợp không có correct_answer hay correct_answer_parts (ví dụ: câu hỏi mở)
            // Chỉ kiểm tra xem người dùng có nhập gì không
            const inputElement = inputElementsInQuestion[0];
            if (inputElement && inputElement.value.trim() !== '') {
                inputElement.classList.add('is-correct'); // Coi là đúng nếu có nhập
            } else {
                inputElement.classList.add('is-incorrect'); // Sai nếu để trống
                isCorrectForQuestion = false;
            }
        }

        if (isCorrectForQuestion) {
            score++;
        }

        // Hiển thị icon phản hồi dựa trên tổng thể đúng/sai của câu hỏi
        if (feedbackIcon) {
            feedbackIcon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
            if (isCorrectForQuestion) {
                feedbackIcon.classList.add('fa-check-circle', 'text-success');
            } else {
                feedbackIcon.classList.add('fa-times-circle', 'text-danger');
            }
            feedbackIcon.style.display = 'inline-block';
        }

        // Thêm giải pháp chi tiết
        const solutionItem = document.createElement('div');
        solutionItem.classList.add('solution-item');

        const questionNumber = qId.replace(/[^0-9]/g, ''); // Trích xuất chỉ số (ví dụ: '1' từ 'qD1', 'qE1')
        const questionTextSolutionDiv = document.createElement('div');
        questionTextSolutionDiv.classList.add('question-text-solution');

        let fullTextHtml = `${questionNumber}. `;
        // Xây dựng lại câu cho giải pháp, làm nổi bật các đáp án đúng
        if (questionInfo.fullSentence) { // Ưu tiên fullSentence nếu có
            fullTextHtml += questionInfo.fullSentence.replace(
                questionInfo.correct_answer || (questionInfo.correct_answer_parts ? questionInfo.correct_answer_parts.join(' ') : ''),
                `<span class="correct-answer-text">${questionInfo.correct_answer || (questionInfo.correct_answer_parts ? questionInfo.correct_answer_parts.join(' ') : '')}</span>`
            );
        } else if (questionInfo.correct_answer_parts) {
            // Đối với câu hỏi nhiều chỗ trống, lặp qua text_parts và chèn các đáp án đúng
            let blankIndex = 0;
            for (let i = 0; i < questionInfo.text_parts.length; i++) {
                fullTextHtml += questionInfo.text_parts[i];
                if (blankIndex < questionInfo.correct_answer_parts.length) {
                    fullTextHtml += `<span class="correct-answer-text">${questionInfo.correct_answer_parts[blankIndex]}</span>`;
                    blankIndex++;
                }
            }
        } else if (questionInfo.correct_answer) {
            // Đối với câu hỏi một chỗ trống
            fullTextHtml += `${questionInfo.text_parts[0]} <span class="correct-answer-text">${questionInfo.correct_answer}</span> ${questionInfo.text_parts[1] || ''}`;
        } else {
            // Trường hợp câu hỏi mở, chỉ hiển thị câu hỏi gốc và đáp án mẫu
            fullTextHtml += questionItemElement.querySelector('.question-text').innerText.replace(/\s*<input[^>]*>\s*/g, ' ').trim(); // Lấy text gốc
            fullTextHtml += `<br><em>Đáp án mẫu: <span class="correct-answer-text">${questionInfo.correct_answer}</span></em>`;
        }
        questionTextSolutionDiv.innerHTML = fullTextHtml;
        solutionItem.appendChild(questionTextSolutionDiv);

        const grammarExplanationDiv = document.createElement('div');
        grammarExplanationDiv.classList.add('grammar-explanation');
        grammarExplanationDiv.innerHTML = `<strong>Giải thích ngữ pháp & ngữ cảnh:</strong> ${questionInfo.explanation}<br>${questionInfo.grammar_note}`;
        solutionItem.appendChild(grammarExplanationDiv);

        const translationDiv = document.createElement('div');
        translationDiv.classList.add('translation');
        translationDiv.innerHTML = `<strong>Dịch:</strong> ${questionInfo.translation}`;
        solutionItem.appendChild(translationDiv);

        solutionListDiv.appendChild(solutionItem);
    });

    // Hiển thị điểm số
    const scoreDisplay = document.getElementById(scoreDisplayId);
    scoreDisplay.textContent = `Bạn đã đạt ${score} / ${totalQuestions} điểm.`;

    // Áp dụng mã màu cho hiển thị điểm dựa trên hiệu suất
    scoreDisplay.classList.remove('text-success', 'text-warning', 'text-danger');
    if (score === totalQuestions) {
        scoreDisplay.classList.add('text-success');
    } else if (score >= totalQuestions / 2) {
        scoreDisplay.classList.add('text-warning');
    } else {
        scoreDisplay.classList.add('text-danger');
    }
    scoreDisplay.style.display = 'block'; // Hiển thị hiển thị điểm

    // Cuộn đến hiển thị điểm
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

    const textInputs = formElement.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.value = ''; // Xóa trường văn bản
        input.classList.remove('is-correct', 'is-incorrect'); // Xóa các lớp phản hồi
    });

    // Tìm các icon phản hồi chỉ trong form này
    const feedbackIcons = formElement.querySelectorAll('.feedback-icon');
    feedbackIcons.forEach(icon => {
        icon.classList.remove('fa-check-circle', 'fa-times-circle', 'text-success', 'text-danger');
        icon.style.display = 'none'; // Ẩn icon phản hồi
    });

    document.getElementById(scoreDisplayId).textContent = ''; // Xóa văn bản điểm
    document.getElementById(scoreDisplayId).style.display = 'none'; // Ẩn hiển thị điểm
    document.getElementById(solutionSectionId).style.display = 'none'; // Ẩn phần giải pháp
    document.querySelector(`#${solutionSectionId} .solution-list`).innerHTML = ''; // Xóa danh sách giải pháp
}
