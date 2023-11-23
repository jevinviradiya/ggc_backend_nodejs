const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
// const { TransactionValidation } = require('../../validations/TransactionValidation');
const Transaction = models.transaction;

//Create Transaction 
const createTransaction = async (req, res) => {

    try {

                  const TransactionInfo = await Transaction.create(req.body);
                  TransactionInfo.save();
                  if(TransactionInfo){

                     return  responseData.sendResponse(
                        res,
                        'Transaction successfully done!',
                        TransactionInfo
                    );       
                   }else{
                     return responseData.errorResponse(res, 'Transaction failed!');
                   }
        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Get all Transactions
const getAllTransactions = async (req,res) => {
    
    try {
        
        let TransactionData;
        if(req.query.success_status == 'successful'){
            TransactionData = await Transaction.find({ success_status: 'successful', is_deleted:false })
        }else if(req.query.success_status == 'rejected'){
            TransactionData = await Transaction.find({ success_status: 'rejected', is_deleted:false })
        }else{
            TransactionData = await Transaction.find({ is_deleted:false })
        }
 
            responseData.sendResponse(
                res,
                'Transaction Details' ,
                TransactionData

            )
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Update Transaction
// const updateTransactionById  = async (req,res) => {
//     try {

//         const TransactionExist = await Transaction.find({_id: req.params.TransactionId, is_deleted: false})

//         if(TransactionExist){

//             const TransactionUpdate = await Transaction.findByIdAndUpdate({_id: req.params.TransactionId}, req.body)

//             if(TransactionUpdate){

//           const pckg = await Transaction.find({_id: req.params.TransactionId})

//             responseData.sendResponse(
//                 res,
//                 'Transaction updated successfully!' ,
//                 pckg
//             )
//             }else{
//           responseData.errorResponse(res, 'Transaction update failed!');

//             }
//         }else{
//          responseData.sendMessage(res, 'Transaction not found!', []);
//         }
        
//     } catch (error) {
//         helper.logger.error(error);
//         responseData.errorResponse(res, 'Something went wrong!');
//     }
    
// }

//Delete Transaction
const deleteTransactionById = async (req, res) => {
    try {
        
        const TransactionExist = await Transaction.find({_id: req.params.transactionId, is_deleted: false})

        if (TransactionExist) {

            const pckg = await Transaction.findByIdAndUpdate({ _id: req.params.transactionId }, { is_deleted: true,  deletedAt: new Date() })

            if (pckg) {
                responseData.sendResponse(
                    res,
                    'Transaction deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Transaction delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Transaction not found!', []);
        }

   
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get Transaction by id
const getTransactionById = async (req, res) => {
    try {

        const TransactionExist = await Transaction.find({_id: req.params.transactionId, is_deleted: false})

        if (TransactionExist) {

                responseData.sendResponse(
                    res,
                    'Transaction Details',
                    TransactionExist
                )
           
        } else {
            responseData.sendMessage(res, 'Transaction not found!', []);
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


module.exports = {createTransaction, getAllTransactions, deleteTransactionById, getTransactionById}
