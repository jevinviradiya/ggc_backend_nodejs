const {createPackage, getAllPackages, updatePackageById, deletePackageById, getPackageById} = require('../../controller/MembershipPackages/packageController')
const { checkUserPermission } = require('../../middleware/verifyRole')
const {verifyToken} = require('../../middleware/verifyToken')

const packageRoute = (app) => {  
    app.post('/create-package',verifyToken,  createPackage)
    app.get('/get-all-packages', verifyToken,  getAllPackages)
    app.put('/update/:packageId',verifyToken,  updatePackageById)
    app.delete('/delete/:packageId',verifyToken,  deletePackageById)
    app.get('/package-by-id/:packageId',verifyToken,  getPackageById)
}

module.exports =  packageRoute;
