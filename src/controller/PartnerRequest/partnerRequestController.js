const models = require('../../model/index')
const partnerRequest = models.partnerRequest;
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { requestVaidation } = require('../../validations/partnerRequestValidation');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');

//create partner request
const createPartnerRequest = async (req, res) => {
    try {

        const requestValidate = await requestVaidation.createRequest(req.body);

        if(requestValidate.error){
            return responseData.errorResponse(res, requestValidate.error.details[0].message);
        }
         
        const createRequest = await partnerRequest.create(req.body)
        createRequest.save()

        if (createRequest) {
           
            let requestPartnerData =  await partnerRequest.aggregate([
     
                 {
                     '$match': {
                         '_id': new mongoose.Types.ObjectId(createRequest._id)
                     }
                 },
                 {
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
                      'from': 'roles',
                      'localField': 'role_id',
                      'foreignField': '_id',
                      'as': 'role'
                  }
              }, {
                  '$unwind': {
                      'path': '$role'
                  }
              },{
                   '$addFields': {
                     'country_name': '$country.country_name', 
                     'state_name': '$state.state_name', 
                     'city_name': '$city.city_name', 
                     'postalcode': '$postalcode.postal_code',
                     'role': '$role.role'
                   }
                 },
                 {
                     '$project':{
                         'country': 0,
                         'state':0,
                         'city':0,
                     }
                 }
             ])

            responseData.sendResponse(res, "Partner Request sent successfully", requestPartnerData)
        } else {
            responseData.errorResponse(res, 'Partner Request send failed!');
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//get all partner request - status wise
const getAllPartnerRequest = async (req, res) => {
    try {

        let requestQuery = { is_deleted: false};
   
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let requestPartnerData;
        let requestPartnerDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        if(req.query.status && req.query.status == 'approved'){
            requestQuery =  Object.assign(requestQuery, {status : 'approved'})
          } else if(req.query.status == 'pending'){
            requestQuery = Object.assign(requestQuery, {status : 'pending'})
          }else if(req.query.status == 'rejected'){
            requestQuery = Object.assign(requestQuery, {status : 'rejected'})
          }
          
          if (req.query.search) {
            const searchItem = req.query.search;

            const emailQuery = { email: { $regex: searchItem, $options: 'i' } || {}};
            const nameQuery = { name: { $regex: searchItem, $options: 'i' } || {}};

            const mobileNumberPattern = /^\d+$/;
            const isMobileNumber = mobileNumberPattern.test(searchItem);

            const mobileQuery = isMobileNumber ? { mobile_number: Number(searchItem) } : {};
            if (isMobileNumber) {
                requestQuery =  Object.assign(requestQuery, {mobileQuery});
            } else if (searchItem) {
                
                requestQuery = Object.assign(requestQuery, {  $or: [
                  nameQuery,
                  emailQuery
                ]});
              }
              
            }

        requestPartnerData =  await partnerRequest.aggregate([

            {
                '$match': requestQuery
            },
            {
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
            }, {
              '$lookup': {
                  'from': 'roles',
                  'localField': 'role_id',
                  'foreignField': '_id',
                  'as': 'role'
              }
            }, {
              '$unwind': {
                  'path': '$role'
              }
            }, {
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name', 
                'postalcode': '$postalcode.postal_code',
                'role': '$role.role'
              }
            }, {
                '$project':{
                    'country': 0,
                    'state':0,
                    'city':0,
                }
            }, {
                '$sort': {
                  createdAt: -1
                }
            }, {
                '$skip': skip
            }, {
                '$limit': limit
              }
        ])
        // requestPartnerData = await partnerRequest.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
        
        
        requestPartnerDataCount = await partnerRequest.countDocuments(requestQuery)

        totalPages = Math.ceil(requestPartnerDataCount / limit);
        successData.requestPartnerData = requestPartnerData;
        successData.requestPartnerDataCount = requestPartnerDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
        if (requestPartnerData.length > 0) {

            responseData.sendResponse(res, 'Partner Request details available', successData)
        } else {
            responseData.sendMessage(res, 'Partner Request not found', successData.requestPartnerData)
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

// status update of partner request - pending/approved/rejected
const statusUpdatePartnerRequest = async (req, res) => {
    try {

        const requestExist = await partnerRequest.find({ _id: req.params.requestId, is_deleted: false, is_active: true })

        if (!requestExist) {
            responseData.sendMessage(res, 'Partner Request not found', [])
        }

        const approveReq = await partnerRequest.findByIdAndUpdate({ _id: req.params.requestId }, { status: req.body.status })

        if (approveReq) {
            const updatedRequest = await partnerRequest.aggregate([
     
                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(req.params.requestId)
                    }
                },
                {
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
                }, {
                  '$addFields': {
                    'country_name': '$country.country_name', 
                    'state_name': '$state.state_name', 
                    'city_name': '$city.city_name', 
                    'postalcode': '$postalcode.postal_code'
                  }
                },
                {
                    '$project':{
                        'country': 0,
                        'state':0,
                        'city':0,
                        // 'postalcode':0,
                    }
                }
            ])

            if (updatedRequest) {
                responseData.sendResponse(res, 'Partner Request status updated successfully!', updatedRequest)
            } else {
                responseData.errorResponse(res, 'Partner Request status update failed!')
            }
        } else {
            responseData.errorResponse(res, 'Partner Request status update failed!')
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//get partner request by id
const getRequestById = async (req, res) => {
    try {
    
        const requestExist = await partnerRequest.aggregate([

            {
                '$match': {
                    '_id': new mongoose.Types.ObjectId(req.params.requestId),
                    'is_deleted': false
                }
            },
            {
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
                  'from': 'roles',
                  'localField': 'role_id',
                  'foreignField': '_id',
                  'as': 'role'
              }
          }, {
              '$unwind': {
                  'path': '$role'
              }
          },{
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name', 
                'postalcode': '$postalcode.postal_code',
                'role': '$role.role'
              }
            },
            {
                '$project':{
                    'country': 0,
                    'state':0,
                    'city':0,
                }
            }
          ])
    
        if(requestExist){
            responseData.sendResponse(res, 'Partner Request details available', requestExist)
        }else{
            responseData.sendMessage(res, 'Partner Request not found', [])
        }
    
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//update partner request
const updatePartnerRequest = async (req, res) => {
    try {
         
        const requestExist = await partnerRequest.findOne({_id: req.params.requestId})

        if(!requestExist){
            responseData.sendMessage(res, 'Partner Request not found', []);
        }else{

            const updateRequest = await partnerRequest.findByIdAndUpdate({_id: req.params.requestId}, req.body)
    
            if (updateRequest) {

                const updatedRequest = await partnerRequest.aggregate([
     
                    {
                        '$match': {
                            '_id': new mongoose.Types.ObjectId(req.params.requestId)
                        }
                    },
                    {
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
                          'from': 'roles',
                          'localField': 'role_id',
                          'foreignField': '_id',
                          'as': 'role'
                      }
                  }, {
                      '$unwind': {
                          'path': '$role'
                      }
                  }, {
                      '$addFields': {
                        'country_name': '$country.country_name', 
                        'state_name': '$state.state_name', 
                        'city_name': '$city.city_name', 
                        'postalcode': '$postalcode.postal_code',
                        'role': '$role.role'
                      }
                    },
                    {
                        '$project':{
                            'country': 0,
                            'state':0,
                            'city':0,
                        }
                    }
                ])
                responseData.sendResponse(res, "Partner Request update successfully", updatedRequest)

            } else {
                responseData.errorResponse(res, 'Partner Request update failed!');
            }
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}


//delete partner request
const deletePartnerRequestById = async (req, res) => {
    try {

        const requestExist = await partnerRequest.findOne({_id : req.params.requestId, is_deleted:false})
      
        if (requestExist) {

            const deleteRequest = await partnerRequest.findByIdAndUpdate({ _id: req.params.requestId }, { is_deleted: true, is_active: false, deletedAt: new Date() })

            if (deleteRequest) {

                responseData.sendResponse(
                    res,
                    'Request deleted successfully!',
                )
            } else {
                responseData.errorResponse(
                    res,
                    'Request delete failed!',
                    []
                )
            }
        } else {
            responseData.sendMessage(res, 'Request not found!', []);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//download request data
const downloadRequestData = async (req, res) => {
  try {

      let requestQuery = { is_deleted: false};
 
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      let requestPartnerData;
      let requestPartnerDataCount;
      let totalPages;
      let currentPage;
      let successData = {};


      if(req.query.status && req.query.status == 'approved'){
        requestQuery =  Object.assign(requestQuery, {status : 'approved'})
      } else if(req.query.status == 'pending'){
        requestQuery = Object.assign(requestQuery, {status : 'pending'})
      }else if(req.query.status == 'rejected'){
        requestQuery = Object.assign(requestQuery, {status : 'rejected'})
      }

        if (req.query.search) {
          const searchItem = req.query.search;

          const emailQuery = { email: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };
          const nameQuery = { name: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };

          const mobileNumberPattern = /^\d+$/;
          const isMobileNumber = mobileNumberPattern.test(searchItem);

          const mobileQuery = isMobileNumber ? { mobile_number: Number(searchItem) } : {};
          if (isMobileNumber) {
            requestQuery =  Object.assign(requestQuery, {mobileQuery});
          } else if (searchItem) {
            requestQuery = Object.assign(requestQuery, {  $or: [
              nameQuery,
              emailQuery
            ]});
          }
          
      }

      requestPartnerData =  await partnerRequest.aggregate([

          {
              '$match': requestQuery
          },
          {
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
                'from': 'roles',
                'localField': 'role_id',
                'foreignField': '_id',
                'as': 'role'
            }
        }, {
            '$unwind': {
                'path': '$role'
            }
        }, {
            '$addFields': {
              'country_name': '$country.country_name', 
              'state_name': '$state.state_name', 
              'city_name': '$city.city_name', 
              'postalcode': '$postalcode.postal_code',
              'role': '$role.role'
            }
          },
          {
              '$project':{
                  'country': 0,
                  'state':0,
                  'city':0,
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
      ])
      // requestPartnerData = await partnerRequest.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
      requestPartnerDataCount = await partnerRequest.countDocuments(requestQuery)

      totalPages = Math.ceil(requestPartnerDataCount / limit);
      successData.requestPartnerData = requestPartnerData;
      successData.requestPartnerDataCount = requestPartnerDataCount;
      successData.currentPage = page;
      successData.limit = limit;
      successData.totalPages = totalPages;
      if (requestPartnerData.length == 0) {
        responseData.sendMessage(res, 'Partner Request not found', requestPartnerData )
      } else {
        
        const workbook = new excelJS.Workbook();
        const sheetName = 'Request Data';
        const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
      
  
        worksheet.columns = [
          {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'name', key: 'name', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'email', key: 'email', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'phone_code', key: 'phone_code', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'mobile_number', key: 'mobile_number', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'country_name', key: 'country_name', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'state_name', key: 'state_name', width: 50, horizontalCentered : true, verticalCentered: true},
          {header: 'city_name', key: 'city_name', width: 50, horizontalCentered : true, verticalCentered: true},
          {header: 'postalcode', key: 'postalcode', width: 50, horizontalCentered : true, verticalCentered: true},
          {header: 'status', key: 'status', width: 50, horizontalCentered : true, verticalCentered: true},
          {header: 'message', key: 'message', width: 50, horizontalCentered : true, verticalCentered: true},
        ];
  
        // eslint-disable-next-line guard-for-in
        for (i in requestPartnerData) {
          worksheet.addRow(requestPartnerData[i]);
        }
  
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = {bold: true};
        });
  
        const filePath = path.join(__dirname,'../../../public/files', 'Request_Data.xlsx');
   
        workbook.xlsx.writeFile(filePath).then(() => {
          const downloadUrl = `${process.env.IMG_PATH}public/files/Request_Data.xlsx`;
  
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

module.exports = { createPartnerRequest, getAllPartnerRequest, statusUpdatePartnerRequest, getRequestById,  deletePartnerRequestById, updatePartnerRequest, downloadRequestData }
