const models = require('../../model/index');
const Role = models.role;
const User = models.user;
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const excelJS = require('exceljs');
const path = require('path');

// create roles and their permissions
const createRoles = async(req, res) => {
    try {
        const roleExist = await Role.findOne({role: { $regex: req.body.role, $options: 'i' }, is_deleted: false, is_active:true})

        if(roleExist){
          return responseData.errorResponse(res, 'This Role already exist!');
        }
        let roleInfo = req.body;
        const roleData = await Role.create(roleInfo);
        roleData.save()

        if(roleData){
            responseData.sendResponse(res, "Role created successfully",roleData)
        }else{
            responseData.errorResponse(res, 'Role creation failed!');
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get all roles
const getAllRoles = async (req, res) => {
    try {
        
        let roleData;
        if(req.query.active == 'true'){
            roleData = await Role.find({ is_active: true, is_deleted:false })
        }else if(req.query.active == 'false'){
            roleData = await Role.find({ is_active: false, is_deleted:false })
        }else{
            roleData = await Role.find({ is_deleted:false })
        }
    if(roleData.length > 0){

        responseData.sendResponse(res, "Role Data", roleData)
    }else{
        responseData.sendMessage(res, "Role not found", [])

    }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// inActive role by roleID
const roleById = async (req, res) => {
    try {

        const roleExist = await Role.findOne({_id : req.params.roleId, is_deleted:false})
      
        if (roleExist) {

                responseData.sendResponse(
                    res,
                    'Role Deatils',
                    roleExist
                )
           
        } else {
            responseData.sendMessage(res, 'Role not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// update role
const updateRole = async (req, res) => {
    try {

        const roleExist = await Role.findOne({_id : req.params.roleId,  is_deleted:false})
      
        if (roleExist) {
            if(req.body.role && req.body.role != roleExist.role){
                
                const roleNameExist = await Role.findOne({role: { $regex: req.body.role, $options: 'i' }, is_deleted: false, is_active:true})

                if(roleNameExist){
                return responseData.errorResponse(res, 'This Role already exist!');
                }
            }
            
            let updateRole;
           
                updateRole = await Role.findByIdAndUpdate({ _id: req.params.roleId }, req.body)

            if (updateRole) {

                const updatedRole = await Role.findOne({_id : req.params.roleId})

                responseData.sendResponse(
                    res,
                    'Role updated successfully!',
                    updatedRole
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Role update failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Role not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// delete role
const deleteRoleById = async (req, res) => {
    try {

        const roleExist = await Role.findOne({_id : req.params.roleId, is_deleted:false})
      
        if (roleExist) {

            const roleAssigned = await User.find({role_id : req.params.roleId })

            if(roleAssigned.length > 0){
            return responseData.errorResponse(res, 'Role is assigned and cannot be deleted');
            }

            const deleteRole = await Role.findByIdAndUpdate({ _id: req.params.roleId }, { is_deleted: true, is_active: false, deletedAt: new Date() })

            if (deleteRole) {

                responseData.sendResponse(
                    res,
                    'Role deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Role delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Role not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// download role data
const downloadRoleData = async (req, res) => {
    try {
        
        let roleData;
        if(req.query.active == 'true'){
            roleData = await Role.find({ is_active: true, is_deleted:false })
        }else if(req.query.active == 'false'){
            roleData = await Role.find({ is_active: false, is_deleted:false })
        }else{
            roleData = await Role.find({ is_deleted:false })
        }
    if(roleData.length == 0){
        responseData.sendMessage(res, "Role not found", roleData)
    }else{
       

        const workbook = new excelJS.Workbook();
        const sheetName = 'Role Data';
        const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
      
  
        worksheet.columns = [
          {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'role', key: 'role', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'permissions', key: 'permissions', width: 50, horizontalCentered : true, verticalCentered: true},
        ];
  
        // eslint-disable-next-line guard-for-in
        for (i in roleData) {
          worksheet.addRow(roleData[i]);
        }
  
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = {bold: true};
        });
  
        const filePath = path.join(__dirname,'../../../public/files', 'Role_Data.xlsx');
   
        workbook.xlsx.writeFile(filePath).then(() => {
          const downloadUrl = `${process.env.IMG_PATH}public/files/Role_Data.xlsx`;
  
          responseData.sendResponse(res, 'Url for download data', downloadUrl);
        })
            .catch((err) => {
              responseData.sendMessage(res, 'Error creating Excel file:', err);
            });
      
          
    }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {createRoles, getAllRoles, roleById, updateRole, deleteRoleById, downloadRoleData}