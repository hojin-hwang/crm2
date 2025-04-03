const File = require('../models/file');
const Board = require('../models/board');
const Product = require('../models/product');
const Sheet = require('../models/sheet');
const Work = require('../models/work');
const recordConfig = require('../config/recordConfig');

class RecordLimitValidator {
    static async validateCollectAmount(req, collect) {
        try {
            if(recordConfig[req.user.clientInfo.price] === 'professional') return true;
            const option =  { clientId: req.user.clientId };
            let count = 0;
            switch(collect) {
            case "board":
                count = await Board.countDocuments(option);
            break;    
            case "product":
                count =  await Product.countDocuments(option);
            break;    
            case "sheet":
                count =  await Sheet.countDocuments(option);
            break;    
            case "work":
                count =  await Work.countDocuments(option);
            break;    
            }

            if (recordConfig[req.user.clientInfo.price][collect] > count) {
                return true;
            }
            else return false;
        } catch(error) {
            console.log('오류 발생', error);
            return true;
        }
    }

    static async validateFileSize(req)
    {
        try {
            if(recordConfig[req.user.clientInfo.price] === 'professional') return true;
            const result = await File.aggregate([
                { $match: { clientId: req.user.clientId } }, 
                { 
                    $group: { 
                        _id: null, 
                        totalSize: { $sum: "$size" } 
                    } 
                }
            ]);
            const size = result[0]?.totalSize || 0
            if (recordConfig[req.user.clientInfo.price].file > size) {
                return true;
            }
            else return false;
        } 
        catch(error) {
            console.log(error)
            return true;
        }
    }

}

module.exports = RecordLimitValidator; 