const File = require('../models/file');
const fs = require('fs');

class FileDelete {
    static async removeFile(req, contentsId) {
        try {
            const fileList = await File.find({contentsId, clientId: req.user.clientId}).exec();
            fileList.forEach(async (file) => {
                await File.deleteOne({contentsId : file.contentsId, clientId: req.user.clientId});
                fs.stat(file.path, (err, stats) => {
                    if (err) {
                        console.error('파일을 찾을 수 없습니다.', err);
                        return;
                    }
                });
                await fs.promises.unlink(file.path);
            });
        }
        catch(error) {
            console.log(error)
        }
    }
}

module.exports = FileDelete;