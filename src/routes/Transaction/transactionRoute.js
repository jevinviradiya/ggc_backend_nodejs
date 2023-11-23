const { createTransaction, getAllTransactions, deleteTransactionById, getTransactionById } = require('../../controller/Transaction/transactionController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');

const stateRoute = (app) => {
    app.post('/create-transaction',verifyToken, checkRolePermission(['Transaction', 'is_add']), createTransaction);
    app.get('/all-transaction', getAllTransactions)
    // app.put('/update-transaction/:transactionId',verifyToken,  checkRolePermission(['State', 'is_edit']), updateState)
    app.delete('/delete-transaction/:transactionId',verifyToken, checkRolePermission(['Transaction', 'is_delete']), deleteTransactionById);
    app.get('/transaction-by-id/:transactionId', getTransactionById);

}

module.exports =  stateRoute;