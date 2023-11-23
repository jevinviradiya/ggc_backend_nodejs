const {postCode, getAllCodes, updateCode, inactivateCode, deleteCode, getCodeByCityId, getCodeById, downloadCodeData } = require('../../controller/PostalCode/postalCodeController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');


const pcRoute = (app) => {
    app.post('/create-code',verifyToken, checkRolePermission(['Postalcode', 'is_add']),  postCode);
    app.get('/all-codes', getAllCodes);
    app.put('/update-code/:codeId',verifyToken, checkRolePermission(['Postalcode', 'is_edit']), updateCode);
    app.put('/inactivate-code/:codeId', inactivateCode);
    app.delete('/delete-code/:codeId',verifyToken, checkRolePermission(['Postalcode', 'is_delete']), deleteCode);
    app.get('/code-by-id/:codeId', getCodeById);
    app.get('/code-by-cityid/:cityId', getCodeByCityId);
    app.get('/download-data',verifyToken, checkRolePermission(['Postalcode', 'is_read']), downloadCodeData);

}

module.exports =  pcRoute;