const { getAllRoles, createRoles, inactiveRoleById, updateRole, deleteRoleById , downloadRoleData, roleById} = require('../../controller/Role/roleController');
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const roleRoute = (app) => {
    app.get('/all-roles',  getAllRoles);
    app.post('/create-roles',verifyToken, checkRolePermission(['Role', 'is_add']), createRoles);
    app.put('/update-role/:roleId',verifyToken, checkRolePermission(['Role', 'is_edit']), updateRole);
    app.get('/by-id/:roleId',verifyToken, checkRolePermission(['Role', 'is_read']), roleById);
    app.delete('/delete/:roleId',verifyToken, checkRolePermission(['Role', 'is_delete']), deleteRoleById);
    app.get('/download-data',verifyToken, checkRolePermission(['Role', 'is_read']), downloadRoleData);
  
}

module.exports =  roleRoute;