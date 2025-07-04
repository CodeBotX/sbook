/**
 * Biến toàn cục để lưu trữ dữ liệu câu hỏi.
 * Biến này sẽ được GÁN LẠI trong mỗi file HTML cụ thể hoặc file JS của từng bài tập.
 */
let questionsData = {};

/**
 * Hàm để thiết lập dữ liệu câu hỏi cho bài tập hiện tại.
 * Các file HTML hoặc JS riêng của bài tập sẽ gọi hàm này.
 * @param {object} data - Đối tượng chứa dữ liệu câu hỏi (correct_answer, text_parts, explanation, v.v.).
 */
function setQuestionsData(data) {
    questionsData = data;
}