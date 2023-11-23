const { createPartnerRequest, getAllPartnerRequest, getRequestById, statusUpdatePartnerRequest, deletePartnerRequestById, updatePartnerRequest , downloadRequestData} = require('../../controller/PartnerRequest/partnerRequestController');
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const createPartnerRoute = (app) => {
    app.post('/create-request',  createPartnerRequest);
    app.get('/get-all-request',verifyToken, checkRolePermission(['Partner Request', 'is_read']), getAllPartnerRequest);
    app.put('/status-update/:requestId',verifyToken, checkRolePermission(['Partner Request', 'is_edit']), statusUpdatePartnerRequest);
    app.put('/update/:requestId',verifyToken, checkRolePermission(['Partner Request', 'is_edit']), updatePartnerRequest);
    app.get('/get-by-id/:requestId', getRequestById);
    app.delete('/delete/:requestId',verifyToken, checkRolePermission(['Partner Request', 'is_delete']), deletePartnerRequestById);
    app.get('/download-data',verifyToken, checkRolePermission(['Partner Request', 'is_read']), downloadRequestData);

}

module.exports =  createPartnerRoute;