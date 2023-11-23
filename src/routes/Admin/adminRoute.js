const homePageDetail = require('../../controller/Admin/homePageDetail')
const { adminLogin, adminLogOut, verifyOtpAdmin} = require('../../controller/Admin/authAdmin')
const { getAdminById, getAdminDetails, updateAdminById, updateAdminImage} = require('../../controller/Admin/adminController')
const {resendOtp} = require('../../helper/resendOtp')
const { verifyAdminToken } = require('../../middleware/verifyAdminToken');
const { verifyToken } = require('../../middleware/verifyToken');
const { checkUserPermission } = require('../../middleware/verifyRole');
const { cpUpload } = require('../../middleware/imageUpload');


const adminRoute = (app) => {
   
    app.get('/home-page-details', homePageDetail);
    app.post('/login', adminLogin);
    app.post('/logout',verifyToken, adminLogOut);
    app.post('/verify-otp', verifyOtpAdmin);
    app.post('/resend-otp', resendOtp);
    
    app.get('/get-admin-by-id/:adminId', verifyToken,  getAdminById);
    app.get('/admin-details',verifyToken,  getAdminDetails);
    app.put('/update-admin',verifyToken,  updateAdminById);
    app.put('/update-profile-image', cpUpload, verifyToken,  updateAdminImage)

}

module.exports =  adminRoute;