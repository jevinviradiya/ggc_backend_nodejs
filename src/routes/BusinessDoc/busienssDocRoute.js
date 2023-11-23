const { getAllbusinessDocs, businessDocsByBusinessId, uploadBusinessDocs, updateBusinessDoc, businessDocStatusUpdate, deletebusinessDocById } = require('../../controller/Business/businessDocsController');
const { cpUpload, docUpload } = require('../../middleware/imageUpload');
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const businessDocRoute = (app) => {
    app.get('/get-all', verifyToken, checkRolePermission(['Business Document', 'is_read']), getAllbusinessDocs);
    app.post('/upload',verifyToken, docUpload, checkRolePermission(['Business Document', 'is_add']), uploadBusinessDocs);
    app.put('/update/:docId',verifyToken, docUpload, checkRolePermission(['Business Document', 'is_edit']), updateBusinessDoc);
    // app.put('/update-status/:docId',verifyToken, checkRolePermission(['Business Document', 'is_edit']),  businessDocStatusUpdate);
    app.delete('/delete/:docId',verifyToken, checkRolePermission(['Business Document', 'is_delete']),  deletebusinessDocById);
    app.get('/by-business-id/:businessId',verifyToken, checkRolePermission(['Business Document', 'is_read']),  businessDocsByBusinessId);
  
}

module.exports =  businessDocRoute;