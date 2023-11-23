const {registerPayment, getAllPayments, getPaymentByRequestId, updatePaymentData, deletePaymentData, getPaymentById, downloadPaymentData} = require('../../controller/Payment/paymentController');
const {verifyToken} = require('../../middleware/verifyToken');
const { checkRolePermission } = require('../../middleware/verifyRole');


const paymentRoute = (app) => {
    app.post('/register-payment',verifyToken, checkRolePermission(['Payment', 'is_add']),  registerPayment);
    app.get('/all-payment',verifyToken, checkRolePermission(['Payment', 'is_read']), getAllPayments);
    app.put('/update-payment/:paymentId',verifyToken, checkRolePermission(['Payment', 'is_edit']), updatePaymentData);
    app.delete('/delete-payment/:paymentId',verifyToken, checkRolePermission(['Payment', 'is_delete']), deletePaymentData);
    app.get('/payment-by-request-id/:requestId',verifyToken, checkRolePermission(['Payment', 'is_read']), getPaymentByRequestId);
    app.get('/payment-by-id/:paymentId',verifyToken, checkRolePermission(['Payment', 'is_read']), getPaymentById);
    app.get('/download-data',verifyToken, checkRolePermission(['Payment', 'is_read']), downloadPaymentData);

}

module.exports =  paymentRoute;