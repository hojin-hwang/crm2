// const File = require('../models/file');
// const Board = require('../models/board');
// const Product = require('../models/product');
// const Sheet = require('../models/sheet');
const Client = require('../models/client');
const recordConfig = require('../config/recordConfig');

class RecordLimitValidator {
    static async validateCollectAmount(req, collect) {
        try {
            if(recordConfig[req.user.clientInfo.price] === 'professional') return true;
            const doc = await Client.findOne({ clientId: req.user.clientId });
            if (recordConfig[req.user.clientInfo.price][collect] > doc.limit[collect]) {
                return true;
            }
            else return false;
        } catch(error) {
            console.log('오류 발생', error);
            return true;
        }
    }

    // static async validateFileSize(req)
    // {
    //     try {
    //         if(recordConfig[req.user.clientInfo.price] === 'professional') return true;
    //         const result = await File.aggregate([
    //             { $match: { clientId: req.user.clientId } }, 
    //             { 
    //                 $group: { 
    //                     _id: null, 
    //                     totalSize: { $sum: "$size" } 
    //                 } 
    //             }
    //         ]);
    //         const size = result[0]?.totalSize || 0
    //         if (recordConfig[req.user.clientInfo.price].file > size) {
    //             return true;
    //         }
    //         else return false;
    //     } 
    //     catch(error) {
    //         console.log(error)
    //         return true;
    //     }
    // }

}

module.exports = RecordLimitValidator; 