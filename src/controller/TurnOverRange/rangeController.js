const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
// const { rangeValidation } = require('../../validations/rangeValidation');
const Range = models.range;

//Create Range 
const createRange = async (req, res) => {

    try {

                  const rangeInfo = await Range.create(req.body);
                  rangeInfo.save();
                  if(rangeInfo){

                     return  responseData.sendResponse(
                        res,
                        'Range created successfully!',
                        rangeInfo
                    );       
                   }else{
                     return responseData.errorResponse(res, 'Create Range failed!');
                   }
        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Get all ranges
const getAllRanges = async (req,res) => {
    
    try {
        
        let rangeData;
        if(req.query.active == 'true'){
            rangeData = await Range.find({ is_active: true, is_deleted:false })
        }else if(req.query.active == 'false'){
            rangeData = await Range.find({ is_active: false, is_deleted:false })
        }else{
            rangeData = await Range.find({ is_deleted:false })
        }
 
            responseData.sendResponse(
                res,
                'Range Details' ,
                rangeData

            )
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Update Range
const updateRangeById  = async (req,res) => {
    try {

        const rangeExist = await Range.find({_id: req.params.rangeId, is_deleted: false})

        if(rangeExist){

            const rangeUpdate = await Range.findByIdAndUpdate({_id: req.params.rangeId}, req.body)

            if(rangeUpdate){

          const pckg = await Range.find({_id: req.params.rangeId})

            responseData.sendResponse(
                res,
                'Range updated successfully!' ,
                pckg
            )
            }else{
          responseData.errorResponse(res, 'Range update failed!');

            }
        }else{
         responseData.sendMessage(res, 'Range not found!', []);
        }
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
    
}

//Delete Range
const deleteRangeById = async (req, res) => {
    try {
        
        const rangeExist = await Range.find({_id: req.params.rangeId, is_deleted: false})

        if (rangeExist) {

            const pckg = await Range.findByIdAndUpdate({ _id: req.params.rangeId }, { is_deleted: true,  deletedAt: new Date() })

            if (pckg) {
                responseData.sendResponse(
                    res,
                    'Range deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Range delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Range not found!', []);
        }

   
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get Range by id
const getRangeById = async (req, res) => {
    try {

        const rangeExist = await Range.find({_id: req.params.rangeId, is_deleted: false})

        if (rangeExist) {

                responseData.sendResponse(
                    res,
                    'Range Details',
                    rangeExist
                )
           
        } else {
            responseData.sendMessage(res, 'Range not found!', []);
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {createRange, getAllRanges, updateRangeById, deleteRangeById, getRangeById}
