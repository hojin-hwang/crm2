const path = require('path');
const fileConfig = require('../config/fileConfig');

class FileValidator {
    static validateFileType(mimetype, filename) {
        // 파일 타입 검사
        // if (!fileConfig.upload.allowedTypes.includes(mimetype)) {
        //     throw new Error('지원하지 않는 파일 형식입니다.');
        // }

        // 파일 확장자 검사
        const ext = path.extname(filename).toLowerCase();
        // const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
        // if (!allowedExtensions.includes(ext)) {
        //     throw new Error('지원하지 않는 파일 확장자입니다.');
        // }
        const notAllowedExtensions = ['.ext'];
        if (notAllowedExtensions.includes(ext)) {
            throw new Error('지원하지 않는 파일 확장자입니다.');
        }
    }

    static validateFileName(filename) {
        // 파일명 길이 검사
        if (filename.length > 255) {
            throw new Error('파일명이 너무 깁니다.');
        }

        // 파일명에 허용되지 않는 문자 검사
        const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
        if (invalidChars.test(filename)) {
            throw new Error('파일명에 허용되지 않는 문자가 포함되어 있습니다.');
        }
    }

    static validateFileSize(size) {
        if (size > fileConfig.upload.maxSize) {
            throw new Error(`파일 크기는 ${fileConfig.upload.maxSize / (1024 * 1024)}MB를 초과할 수 없습니다.`);
        }
    }

    static validateImageDimensions(width, height) {
        const maxDimension = 5000; // 최대 5000px
        if (width > maxDimension || height > maxDimension) {
            throw new Error('이미지 크기가 너무 큽니다.');
        }
    }
}

module.exports = FileValidator; 