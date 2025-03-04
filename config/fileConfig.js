const KB = 1024;
const MB = KB * 1024;

module.exports = {
    upload: {
        maxSize: 5 * MB,  // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        destination: 'public/uploads/',
    },
    image: {
        resize: {
            width: 600,
            quality: 80,
        },
        allowedTypes: ['image/jpeg', 'image/png'],
    }
}; 