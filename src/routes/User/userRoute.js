const {userSignup, userLogin, verifyOtpUser, forgotPassword, resetPassword, userLogOut, verifyOtpUserWeb} = require('../../controller/user/authUser');
const {createUser, updateUserImage, getUserDetails, updateUserById, deleteUserById, getAllUsers, getUserById, downloadUserData, memberRegistration, getUserByRoleId} = require('../../controller/user/userController')
const {resendOtp, sendOtpWeb} = require('../../helper/resendOtp');
const { cpUpload } = require('../../middleware/imageUpload');
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const userRoute = (app) => {
  
    app.post('/login', userLogin);
    app.post('/logout', verifyToken, userLogOut);
    app.post('/signup', userSignup);
    app.post('/verify-otp', verifyOtpUser);
    app.post('/resend-otp', resendOtp);
    app.post('/verify-member-otp', verifyOtpUserWeb);
    app.post('/send-otp', sendOtpWeb);
    app.post('/forgot-password', forgotPassword);
    app.put('/reset-password',verifyToken, resetPassword);
   
    app.post('/create-user', cpUpload, verifyToken, checkRolePermission(['User', 'is_add']), createUser);
    app.put('/update-profile-image/:userId', cpUpload, verifyToken, checkRolePermission(['User', 'is_edit']), updateUserImage);
    app.get('/all-users',verifyToken, checkRolePermission(['User', 'is_read']), getAllUsers);          
    app.get('/user-details',verifyToken, checkRolePermission(['User', 'is_read']), getUserDetails);
    app.get('/get-user-by-id/:userId',verifyToken, checkRolePermission(['User', 'is_read']),  getUserById);
    app.get('/get-user-by-role/:roleId',verifyToken, checkRolePermission(['User', 'is_read']),  getUserByRoleId);
    app.put('/update/:userId', cpUpload, verifyToken, checkRolePermission(['User', 'is_edit']), updateUserById);
    app.delete('/delete/:userId',verifyToken, checkRolePermission(['User', 'is_delete']), deleteUserById);
    app.get('/download-data',verifyToken, checkRolePermission(['User', 'is_read']), downloadUserData);
    

    app.post('/register-member', memberRegistration);

}

module.exports =  userRoute;    
