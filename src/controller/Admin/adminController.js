const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { HasPass } = require('../../helper/HasPass');
const { genOtp } = require('../../helper/generateOtp');
const {adminValidation} = require('../../validations/adminValidation')
const Admin = models.admin;
const User = models.user;


//get logged-in admin Details
const getAdminDetails = async (req, res) => {
    try {
        const admin = await User.findOne({ _id: req.user._id, is_deleted: false })

        if (admin) {
            responseData.sendResponse(
                res,
                'Admin Details',
                admin
            );
        } else {
            responseData.sendMessage(res, 'Admin not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get admin by id
const getAdminById = async (req, res) => {
    try {
        const admin = await User.findOne({ _id: req.params.adminId, is_deleted: false })
        if (admin) {
            responseData.sendResponse(
                res,
                'Admin Details',
                admin
            );
        } else {
            responseData.sendMessage(res, 'Admin not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update admin by id
const updateAdminById = async (req, res) => {
    try {

        // const adminValidate = await adminValidation.updateadminValidation(req.body);

        // if(adminValidate.error){
        //     return responseData.errorResponse(res, adminValidate.error.details[0].message);
        // }

        const adminExist = await User.findOne({ _id: req.user._id, is_deleted: false })

        if (!adminExist) {
            responseData.sendMessage(res, 'Admin not found!', []);
        } else {

            let updateBody = req.body;

            if (req.body.email) {

                const emailExist = await User.findOne({ email: req.body.email, is_deleted: false })

                if (emailExist) {
                    return responseData.errorResponse(res, 'admin email already Exist');
                }

            }

            if (req.body.mobile_number) {

                const mNumberExist = await User.findOne({ mobile_number: req.body.mobile_number, is_deleted: false })

                if (mNumberExist) {
                    return responseData.errorResponse(res, 'Admin mobile number already Exist');
                }

            }

            const updateadmin = await Admin.findByIdAndUpdate({ _id: req.user._id }, updateBody)

            if (updateadmin) {
                const admin = await Admin.findOne({ _id: req.user._id })

                responseData.sendResponse(
                    res,
                    'admin updated successfully!',
                    admin
                );
            } else {
                responseData.errorResponse(res, 'admin update failed!');
            }
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update user image
const updateAdminImage = async (req, res) => {
    try {
      const adminExist = await Admin.findOne({
        _id: req.user._id,
        is_deleted: false,
      });

      if (!adminExist) {
        return responseData.errorResponse(res, 'Admin does not exist');
      } else {
        const adminImage = await Admin.findByIdAndUpdate(
            {_id: req.user._id},
            {
              profile_picture: `${process.env.IMG_PATH}public/images/${req.file}`,
            },
        );

        if (adminImage) {
          responseData.sendResponse(
              res,
              'Admin profile image uploaded successfully',
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

module.exports = { getAdminDetails, getAdminById, updateAdminById, updateAdminImage }