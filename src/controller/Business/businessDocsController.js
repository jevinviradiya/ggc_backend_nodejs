const models = require('../../model/index')
const BusinessDocs = models.businessDocs;
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
// const { budinessValidation } = require('../../validations/businessValidation');


//upload business docs
const uploadBusinessDocs = async (req, res) => {
    try {

        const { document_type, business_id, business_document } = req.body;

        let business_doc = {}

        business_doc.user_id = req.user._id;
        business_doc.business_id = business_id;
        business_doc.document_type = document_type;

        if (req.file) {
            business_doc.business_document = `${process.env.IMG_PATH}public/images/${req.file}`;
        }

        let uploadDoc = await BusinessDocs.create(business_doc);
        uploadDoc.save();

        if (uploadDoc) {
            responseData.sendResponse(res, 'Document uploaded successfully!', uploadDoc);
        } else {
            responseData.errorResponse(res, 'DocumentUpload failed!');
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update business document
const updateBusinessDoc = async (req, res) => {
    try {

        let bodyData = req.body;
        const docExist = await BusinessDocs.findOne({
            _id: req.params.docId,
            is_deleted: false,
        });
        
        if (!docExist) {
            return responseData.errorResponse(res, 'Document does not exist');
        } else {
      
            if(req.file){
                bodyData.business_document = `${process.env.IMG_PATH}public/images/${req.file}`
            }

            if (req.body.status) {
                if (req.body.status == 'approved') {
                    approveReq = await BusinessDocs.findByIdAndUpdate({ _id: req.params.docId }, { status: 'approved', approved_at: new Date(), approved_by: req.user._id, is_verified: true })
                } else {
                    approveReq = await BusinessDocs.findByIdAndUpdate({ _id: req.params.docId }, { status: req.body.status })
                }
            }

            const DocumentImage = await BusinessDocs.findByIdAndUpdate(
                { _id: req.params.docId },
                    bodyData,
            );

            if (DocumentImage) {
                responseData.sendResponse(
                    res,
                    'Business document updated successfully',
                );
            } else {
                helper.logger.error('Something went wrong');
                responseData.errorResponse(res, 'Something went wrong');
            }
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//get all business docs
const getAllbusinessDocs = async (req, res) => {
    try {

        const allDoc = await BusinessDocs.find({ is_deleted: false })

        if (allDoc.length > 0) {
            responseData.sendResponse(res, 'Business Documents', allDoc);

        } else {
            responseData.errorResponse(res, 'Something went wrong!');
        }



    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// status update of document - pending/approved/rejected
const businessDocStatusUpdate = async (req, res) => {
    try {

        const docExist = await BusinessDocs.find({ _id: req.params.docId, is_deleted: false })

        if (!docExist) {
            responseData.sendMessage(res, 'Document not found!', [])
        }
        let approveReq;


        if (req.body.status == 'approved') {
            if (req.user.role_id == 1) {
                approveReq = await BusinessDocs.findByIdAndUpdate({ _id: req.params.docId }, { status: 'approved', approved_at: new Date(), approved_by: req.user._id, approved_by_collection: 'admin', is_verified: true })
            } else {
                approveReq = await BusinessDocs.findByIdAndUpdate({ _id: req.params.docId }, { status: 'approved', approved_at: new Date(), approved_by: req.user._id, approved_by_collection: 'user', is_verified: true })
            }

        } else {
            approveReq = await BusinessDocs.findByIdAndUpdate({  _id: req.params.docId  }, { status: req.body.status })
        }

        if (approveReq) {
            const getReq = await BusinessDocs.findById({ _id: req.params.docId })

            if (getReq) {
                responseData.sendResponse(res, 'Busienss document status updated successfully!', getReq)
            } else {
                responseData.errorResponse(res, 'Busienss document status update failed!')
            }
        } else {
            responseData.errorResponse(res, 'Busienss document status update failed!')
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//delete user by id
const deletebusinessDocById = async (req, res) => {
    try {

        const docExist = await BusinessDocs.findOne({ _id: req.params.docId, is_deleted: false })

        if (docExist) {

            const deletedoc = await BusinessDocs.findByIdAndUpdate({ _id: req.params.docId }, { is_deleted: true, deletedAt: new Date() })

            if (deletedoc) {
                responseData.sendResponse(
                    res,
                    'Document deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Document delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Document not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// business docs by business id
const businessDocsByBusinessId = async (req, res) => {
    try {

        const doc = await BusinessDocs.find({ business_id: req.params.businessId, is_deleted: false })

        if (doc.length > 0) {
            responseData.sendResponse(res, 'Business Documents', doc);
        } else {
            responseData.sendMessage(res, 'Document not found', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}



module.exports = { getAllbusinessDocs, businessDocsByBusinessId, uploadBusinessDocs, updateBusinessDoc, businessDocStatusUpdate, deletebusinessDocById }