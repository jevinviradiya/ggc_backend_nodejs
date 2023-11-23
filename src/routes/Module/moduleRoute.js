const { createModule, getAllModules, inactiveModuleById, updateModule, deleteModuleById } = require('../../controller/Modules/moduleController');
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');


const moduleRoute = (app) => {
    app.get('/all-modules', verifyToken, checkRolePermission(['Module', 'is_read']), getAllModules);
    app.post('/create-module',verifyToken, checkRolePermission(['Module', 'is_add']), createModule);
    app.put('/update-module/:moduleId',verifyToken, checkRolePermission(['Module', 'is_edit']), updateModule);
    app.put('/inactive/:moduleId',verifyToken,  inactiveModuleById);
    app.delete('/delete/:moduleId',verifyToken, checkRolePermission(['Module', 'is_delete']), deleteModuleById);
  
}

module.exports =  moduleRoute;
