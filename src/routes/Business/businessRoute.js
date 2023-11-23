const { createBusiness, getBusinessOfUser,getAllBusinesses, getBusinessByBusinessId, updateBusinessById, deleteBusinessById, updateBusinessLogo } = require('../../controller/Business/businessController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');
const { cpUpload } = require('../../middleware/imageUpload')


const businessRoute = (app) => {
    app.post('/create-business', cpUpload, verifyToken, checkRolePermission(['Business', 'is_add']), createBusiness)
    app.put('/update-business-logo/:businessId', cpUpload, verifyToken, checkRolePermission(['Business', 'is_edit']), updateBusinessLogo);
    app.get('/all-business',verifyToken, checkRolePermission(['Business', 'is_read']), getAllBusinesses)
    app.get('/user-business',verifyToken, checkRolePermission(['Business', 'is_read']), getBusinessOfUser)
    app.get('/business-by-id/:businessId',verifyToken, checkRolePermission(['Business', 'is_read']), getBusinessByBusinessId)
    app.put('/update/:businessId',cpUpload, verifyToken, checkRolePermission(['Business', 'is_edit']), updateBusinessById)
    app.delete('/delete/:businessId',verifyToken, checkRolePermission(['Business', 'is_delete']), deleteBusinessById)
}

module.exports =  businessRoute;
