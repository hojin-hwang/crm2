/**
 * 에러 응답을 생성하는 헬퍼 함수
 * @param {Object} res - Express 응답 객체
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} message - 에러 메시지
 * @param {*} error - 상세 에러 정보 (개발 환경에서만 표시)
 */
const sendErrorResponse = (res, statusCode, message, error = null) => {
    const response = {
        code: statusCode,
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    };
    return res.status(statusCode).json(response);
};

/**
 * 성공 응답을 생성하는 헬퍼 함수
 * @param {Object} res - Express 응답 객체
 * @param {*} data - 응답 데이터
 * @param {string} message - 성공 메시지
 */
const sendSuccessResponse = (res, data, message = '성공') => {
    return res.status(200).json({
        code: 100,
        success: true,
        message: message,
        data: data
    });
};

module.exports = {
    sendErrorResponse,
    sendSuccessResponse
}; 