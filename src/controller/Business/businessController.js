const models = require('../../model/index')
const Business = models.business;
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { businessValidation } = require('../../validations/businessValidation');
const { mongoose } = require('../../config/dbConnection');
    

//create busniess
const createBusiness = async(req, res) => {
    try {
        let data = req.body ; 
        const { business_name, owner_firstname, owner_lastname, business_email, business_contact, establish_year, business_catagory_id, annual_turnover, business_website, address, city_id, state_id,  country_id, postalcode_id, representative_1, representative_2 , business_card , business_logo} = req.body

            data.representative_1 = JSON.parse(data.representative_1)
            data.representative_2 = JSON.parse(data.representative_2)

        const businessValidate = await businessValidation.createBusinessValidation(data)

        if(businessValidate.error){
            return responseData.errorResponse(res, businessValidate.error.details[0].message);
        }

        
        const emailExistence = await Business.findOne({ business_email: business_email, is_deleted: false });

        if (emailExistence) {
            return responseData.sendMessage(
                res,
                'Business already exist with this email!',
            );
        }

        const mobileExistence = await Business.findOne({ business_contact: data.business_contact, is_deleted: false });

        if (mobileExistence) {
            return responseData.sendMessage(
                res,
                'Business already exist with this mobile number!',
            );
        }

        // from where chapter_id will be selected

        let businessData = {};
        businessData.user_id = req.user._id;
        businessData.chapter_id = data.chapter_id;
        businessData.business_name = data.business_name;
        businessData.owner_firstname = data.owner_firstname;
        businessData.owner_lastname = data.owner_lastname;
        businessData.business_email = data.business_email;
        businessData.business_contact = data.business_contact;
        businessData.establish_year = data.establish_year;
        businessData.business_catagory_id = data.business_catagory_id;
        businessData.annual_turnover = data.annual_turnover;
        businessData.business_website = data.business_website;
        businessData.address = data.address;
        businessData.city_id = data.city_id;
        businessData.state_id = data.state_id;
        businessData.country_id = data.country_id;
        businessData.postalcode_id = data.postalcode_id;
        businessData.representative_1 = data.representative_1;
        businessData.representative_2 = data.representative_2;
        businessData.business_card = data.business_card;
        
        if (req.file) {
            businessData.business_logo = `${process.env.IMG_PATH}public/images/${req.file}`;
          }

        let businessInfo = await Business.create(businessData);

        businessInfo.save();

        if(businessInfo){

          let businessData = await Business.aggregate([

            {
              '$match': {
                _id : new mongoose.Types.ObjectId(businessInfo._id),
               }
            }, {
              '$lookup': {
                'from': 'countries',
                'localField': 'country_id',
                'foreignField': '_id',
                'as': 'country'
              }
            }, {
              '$unwind': {
                'path': '$country'
              }
            },
             {
              '$lookup': {
                'from': 'states',
                'localField': 'state_id',
                'foreignField': '_id',
                'as': 'state'
              }
            }, {
              '$unwind': {
                'path': '$state'
              }
            },
             {
              '$lookup': {
                'from': 'cities',
                'localField': 'city_id',
                'foreignField': '_id',
                'as': 'city'
              }
            }, {
              '$unwind': {
                'path': '$city'
              }
            }, 
            {
              '$lookup': {
                'from': 'postalcodes',
                'localField': 'postalcode_id',
                'foreignField': '_id',
                'as': 'postalcode'
              }
            }, {
              '$unwind': {
                'path': '$postalcode'
              }
            }, 
            {
              '$lookup': {
                'from': 'chapters',
                'localField': 'chapter_id',
                'foreignField': '_id',
                'as': 'chapter_data'
              }
            },
            {
              '$unwind': {
                'path': '$chapter_data'
              }
            },
            {
              '$addFields' : {
                'country_name': '$country.country_name',
                'state_name': '$state.state_name',
                'city_name': '$city.city_name',
                'postalcode': '$postalcode.postal_code',
                'chapter_name': "$chapter_data.chapter_name"
            }
            }, 
            {
              '$project' : {
                'country': 0,
                'state': 0,
                'city': 0,
                'chapter_data': 0
              }
            }
          ])

            responseData.sendResponse(res, 'Business registered successfully!', businessData[0])
        }else{
            responseData.sendMessage(res, 'Business registration failed!')
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}
//update user image
const updateBusinessLogo = async (req, res) => {
    try {
      const businessExist = await Business.findOne({
        _id: req.params.businessId,
        is_deleted: false,
      });

      if (!businessExist) {
        return responseData.errorResponse(res, 'Business does not exist');
      } else {
        const BusinessImage = await Business.findByIdAndUpdate(
            {_id: req.params.businessId},
            {
              business_logo: `${process.env.IMG_PATH}public/images/${req.file}`,
            },
        );

        if (BusinessImage) {
          responseData.sendResponse(
              res,
              'Business logo uploaded successfully',
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

//get all businesses
const getAllBusinesses = async(req, res) => {
    try {

        let businessQuery = { is_deleted: false };
        if(req.query.search){
            const searchItem = req.query.search;
            
            const nameQuery = { business_name: { $regex: searchItem, $options: 'i' } || {}};

            // const catagoryQuery = { business_catagory: { $regex: searchItem, $options: 'i' } || {}};
    
            // const mobileNumberPattern = /^\d+$/;
            // const isMobileNumber = mobileNumberPattern.test(searchItem);
           
            // const mobileQuery = isMobileNumber ? { mobile_number: Number (searchItem) } : {};
           
            // if (isMobileNumber) {
            //     query = mobileQuery;
            // } else if (searchItem) {
                businessQuery = { $or: [nameQuery] };
            // }   

        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let businessData;
        let businessDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

        let businessPipeline = [

            {
              '$match': businessQuery
            }, {
              '$lookup': {
                'from': 'countries',
                'localField': 'country_id',
                'foreignField': '_id',
                'as': 'country'
              }
            }, {
              '$unwind': {
                'path': '$country'
              }
            }, {
              '$lookup': {
                'from': 'states',
                'localField': 'state_id',
                'foreignField': '_id',
                'as': 'state'
              }
            }, {
              '$unwind': {
                'path': '$state'
              }
            }, {
              '$lookup': {
                'from': 'cities',
                'localField': 'city_id',
                'foreignField': '_id',
                'as': 'city'
              }
            }, {
              '$unwind': {
                'path': '$city'
              }
            }, {
              '$lookup': {
                'from': 'postalcodes',
                'localField': 'postalcode_id',
                'foreignField': '_id',
                'as': 'postalcode'
              }
            }, {
              '$unwind': {
                'path': '$postalcode'
              }
            }, 
            {
              '$lookup': {
                'from': 'chapters',
                'localField': 'chapter_id',
                'foreignField': '_id',
                'as': 'chapter_data'
              }
            },
            {
              '$unwind': {
                'path': '$chapter_data'
              }
            },
            {
              '$addFields' : {
                'country_name': '$country.country_name',
                'state_name': '$state.state_name',
                'city_name': '$city.city_name',
                'postalcode': '$postalcode.postal_code',
                'chapter_name': "$chapter_data.chapter_name"
            }
            }, 
            {
              '$project' : {
                'country': 0,
                'state': 0,
                'city': 0,
                'chapter_data': 0
              }
            },
            {
              '$sort': {
                createdAt: -1
              }
            },
            {
              '$skip': skip
            },
            {
              '$limit': limit
            }
          ]

        businessData = await Business.aggregate(businessPipeline);
        businessDataCount = await Business.countDocuments(businessQuery)

        totalPages = Math.ceil(businessDataCount / limit);
        successData.businessData = businessData;
        successData.businessDataCount = businessDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
        // successData.search = searchItem;

        if(businessData.length > 0){
            responseData.sendResponse(res, 'Business details available', successData)
        }else{
            responseData.sendMessage(res, 'Business not found', [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//get business Details of logged-in user
const getBusinessOfUser = async (req, res) => {
    try {
        const userBusiness = await Business.find({user_id : req.user._id, is_deleted:false})

        if(userBusiness){
            responseData.sendResponse(res, 'Business details available', userBusiness)
        }else{
            responseData.sendMessage(res, 'Business not found', [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// get business-by-business_id
const getBusinessByBusinessId = async (req, res) => {
try {

    const userBusiness = await Business.findOne({_id : req.params.businessId, user_id: req.user._id, is_deleted: false})

    if(userBusiness){
        responseData.sendResponse(res, 'Business details available', userBusiness)
    }else{
        responseData.sendMessage(res, 'Business not found', [])
    }

} catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
}
}

//update business by businessId
const updateBusinessById = async (req, res) => {
    try {
        
        const businessExist = await Business.findOne({_id:req.params.businessId, user_id: req.user._id, is_deleted:false})

        let businessData = req.body 
        if(businessExist){
           
            if (req.file) {
                businessData.business_logo = `${process.env.IMG_PATH}public/images/${req.file}`;
              }
            const updatedBusiness = await Business.findByIdAndUpdate({_id:req.params.businessId}, businessData)

            if(updatedBusiness){

              let businessData = await Business.aggregate([

                {
                  '$match': {
                    _id : new mongoose.Types.ObjectId(businessExist._id),
                   }
                }, {
                  '$lookup': {
                    'from': 'countries',
                    'localField': 'country_id',
                    'foreignField': '_id',
                    'as': 'country'
                  }
                }, {
                  '$unwind': {
                    'path': '$country'
                  }
                },
                 {
                  '$lookup': {
                    'from': 'states',
                    'localField': 'state_id',
                    'foreignField': '_id',
                    'as': 'state'
                  }
                }, {
                  '$unwind': {
                    'path': '$state'
                  }
                },
                 {
                  '$lookup': {
                    'from': 'cities',
                    'localField': 'city_id',
                    'foreignField': '_id',
                    'as': 'city'
                  }
                }, {
                  '$unwind': {
                    'path': '$city'
                  }
                }, 
                {
                  '$lookup': {
                    'from': 'postalcodes',
                    'localField': 'postalcode_id',
                    'foreignField': '_id',
                    'as': 'postalcode'
                  }
                }, {
                  '$unwind': {
                    'path': '$postalcode'
                  }
                }, 
                {
                  '$lookup': {
                    'from': 'chapters',
                    'localField': 'chapter_id',
                    'foreignField': '_id',
                    'as': 'chapter_data'
                  }
                },
                {
                  '$unwind': {
                    'path': '$chapter_data'
                  }
                },
                {
                  '$addFields' : {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name',
                    'postalcode': '$postalcode.postal_code',
                    'chapter_name': "$chapter_data.chapter_name"
                }
                }, 
                {
                  '$project' : {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                    'chapter_data': 0
                  }
                }
              ])

                if(businessData){
                    responseData.sendResponse(res, 'Business updated successfully!', businessData )
                }
                // else{
                //     response.errorResponse(res, 'Business update failed!')
                // }

            }else{
                responseData.errorResponse(res, 'Business update failed!')
            }

        }else{
            responseData.sendMessage(res, 'Business not found!', [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//delete business by businessId
const deleteBusinessById = async (req, res) => {
    try {

        const businessExist = await Business.findOne({ _id: req.params.businessId, is_deleted: false })

        if (businessExist) {

            const deleteBusiness = await Business.findByIdAndUpdate({ _id: req.params.businessId }, { is_deleted: true,  deletedAt: new Date() })

            if (deleteBusiness) {
                responseData.sendResponse(
                    res,
                    'Business deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Business update failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Business not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


module.exports = {createBusiness, getAllBusinesses, getBusinessOfUser, getBusinessByBusinessId, updateBusinessById, deleteBusinessById, updateBusinessLogo}