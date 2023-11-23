
const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { packageValidation } = require('../../validations/membershipPackageValidation');
const Package = models.membership_package;

//Create Package 
const createPackage = async (req, res) => {

    try {

        const mshipValidate = await packageValidation.createPackage(req.body);

        if(mshipValidate.error){
            return responseData.errorResponse(res, mshipValidate.error.details[0].message);
        }
         
                  const packageInfo = await Package.create(req.body);
                  packageInfo.save();
                  if(packageInfo){

                     return  responseData.sendResponse(
                        res,
                        'Package created successfully!',
                        packageInfo
                    );       
                   }else{
                     return responseData.errorResponse(res, 'Create Package failed!');
                   }
        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Get all packages
const getAllPackages = async (req,res) => {
    
    try {
        let packageData;
        if(req.query.active == 'true'){
            packageData = await Package.find({ is_active: true, is_deleted:false })
        }else if(req.query.active == 'false'){
            packageData = await Package.find({ is_active: false, is_deleted:false })
        }else{
            packageData = await Package.find({ is_deleted:false })
        }

            responseData.sendResponse(
                res,
                'Package Details' ,
                packageData
            )
            
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Update Package
const updatePackageById  = async (req,res) => {
    try {

        const mshipValidate = await packageValidation.updatePackage(req.body);

        if(mshipValidate.error){
            return responseData.errorResponse(res, mshipValidate.error.details[0].message);
        }
        const packageExist = await Package.find({_id: req.params.packageId, is_deleted: false})

        if(packageExist){

            const packageUpdate = await Package.findByIdAndUpdate({_id: req.params.packageId}, req.body)

            if(packageUpdate){

          const pckg = await Package.find({_id: req.params.packageId})

            responseData.sendResponse(
                res,
                'Package updated successfully!' ,
                pckg
            )
            }else{
          responseData.errorResponse(res, 'Package update failed!');

            }
        }else{
         responseData.errorResponse(res, 'Package not found!');
        }
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
    
}

//Delete Package
const deletePackageById = async (req, res) => {
    try {
        

        const packageExist = await Package.find({_id: req.params.packageId, is_deleted: false})


        if (packageExist) {

            const pckg = await Package.findByIdAndUpdate({ _id: req.params.packageId }, { is_deleted: true,  deletedAt: new Date() })

            if (pckg) {
                responseData.sendResponse(
                    res,
                    'Package deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Package delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Package not found!');
        }

   
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get Package by id
const getPackageById = async (req, res) => {
    try {

        const packageExist = await Package.find({_id: req.params.packageId, is_deleted: false})

        if (packageExist) {

                responseData.sendResponse(
                    res,
                    'Package Details',
                    packageExist
                )
           
        } else {
            responseData.sendMessage(res, 'Package not found!');
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {createPackage, getAllPackages, updatePackageById, deletePackageById, getPackageById}