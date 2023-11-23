const models = require('../model/index');
const Role = models.role

// Middleware to check user roles & permissions
const checkRolePermission =  (reqPermission) => {
  return async (req, res, next) => {
    
    const user = req.user; 
    const userRole = await Role.find({ _id: user.role_id, is_active: true, is_deleted: false})
 
    if(userRole.length === 1){
      
      const rolePermissions = userRole[0].permissions;
      
      const [module, permission] = reqPermission;

      if(rolePermissions[module] && rolePermissions[module][permission] === 1){
        next()
      }else{
        res.status(403).json({ error: 'Access denied!' });
      }

    }else{
      res.status(404).json({ error: 'Role not found!' });
    }
  
    };
  }
  
module.exports = {checkRolePermission}


  