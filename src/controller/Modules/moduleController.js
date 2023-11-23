const models = require('../../model/index');
const Module = models.modules
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');


const createModule = async(req, res) => {
    try {
        
        const ModuleExist = await Module.find({name: req.body.Module, is_deleted: false, is_active:true})

        if(ModuleExist){
          return responseData.errorResponse(res, 'This Module already exist!');
        }

        const ModuleData = await Module.create(req.body);
        ModuleData.save()

        if(ModuleData){
            responseData.sendResponse(res, "Module created successfully",ModuleData)
        }else{
            responseData.errorResponse(res, 'Module creation failed!');
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllModules = async (req, res) => {
    try {
        
        let ModuleData;
        if(req.query.active == 'true'){
            ModuleData = await Module.find({ is_active: true, is_deleted:false })
        }else if(req.query.active == 'false'){
            ModuleData = await Module.find({ is_active: false, is_deleted:false })
        }else{
            ModuleData = await Module.find({ is_deleted:false })
        }
    if(ModuleData.length > 0){

        responseData.sendResponse(res, "Module Data", ModuleData)
    }else{
        responseData.sendMessage(res, "Module not found", [])

    }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//inActive Module by ModuleID
const inactiveModuleById = async (req, res) => {
    try {

        const ModuleExist = await Module.findOne({_id : req.params.moduleId, is_active: true, is_deleted:false})
      
        if (ModuleExist) {

            const inactiveModule = await Module.findByIdAndUpdate({ _id: req.params.moduleId }, { is_active: false})

            if (inactiveModule) {

                responseData.sendResponse(
                    res,
                    'Module inactivated successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Module not found!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Module not found!');
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update Module
const updateModule = async (req, res) => {
    try {

        const ModuleExist = await Module.findOne({_id : req.params.moduleId, is_active: true, is_deleted:false})
      
        if (ModuleExist) {
            let updateModule;
    
                updateModule = await Module.findByIdAndUpdate({ _id: req.params.moduleId }, req.body)

            if (updateModule) {

                const updatedModule = await Module.find({ _id: req.params.moduleId })
                responseData.sendResponse(
                    res,
                    'Module updated successfully!',
                    updatedModule
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Module update failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Module not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


//delete Module
const deleteModuleById = async (req, res) => {
    try {

        const ModuleExist = await Module.findOne({_id : req.params.moduleId, is_deleted:false})
      
        if (ModuleExist) {

            const deleteModule = await Module.findByIdAndUpdate({ _id: req.params.moduleId }, { is_deleted: true, is_active: false, deletedAt: new Date() })

            if (deleteModule) {

                responseData.sendResponse(
                    res,
                    'Module deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Module delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Module not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {createModule, getAllModules, inactiveModuleById, updateModule, deleteModuleById}