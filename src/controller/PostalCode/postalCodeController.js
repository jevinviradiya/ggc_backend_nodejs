const models = require('../../model/index');
const PostalCode = models.postalcode
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');

const postCode = async (req, res) => {
    try {

        const codeExist = await PostalCode.findOne({ postal_code: req.body.postal_code , is_deleted:false, is_active:true })

        if (codeExist) {
           return responseData.errorResponse(res, "PostalCode already Exist")
        }
        
        const pcData = await PostalCode.create(req.body)
        pcData.save();

        if (pcData) {

            let pcDataInfo = await PostalCode.aggregate([

                {
                    '$match': { 
                    '_id': new mongoose.Types.ObjectId(pcData._id)
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
                },{
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
                    '$addFields': {
                        'country_name': '$country.country_name',
                        'state_name': '$state.state_name',
                        'city_name': '$city.city_name'
                    }
                },
                {
                    '$project': {
                        'country': 0,
                        'state': 0,
                        'city': 0,
                    }
                }
                
                  ])

            responseData.sendResponse(res, "PostalCode Stored Successfully!", pcDataInfo)
        } else {
            responseData.errorResponse(res, "PostalCode Store failed!")
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllCodes = async (req, res) => {
    try {

        let codeQuery;
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let codeData;
        let codeDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                codeQuery = { is_active: true, is_deleted: false }

            } else if (req.query.active == 'false') {
                codeQuery = { is_active: false, is_deleted: false }

            } else {
                codeQuery = { is_deleted: false }
            }
            
            if(req.query.search){
                const searchItem = req.query.search;
                
                const codePattern = /^[1-9][0-9]{5}$/ ;
                const validcode = codePattern.test(searchItem);
                codeQuery = validcode ? { postal_code: Number (searchItem) } : {};
            }

        let codePipeline = [
            {
              '$match': codeQuery
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
              '$addFields': {
                'country_name': '$country.country_name', 
                'state_name': '$state.state_name', 
                'city_name': '$city.city_name'
              }
            }, {
              '$project': {
                'country': 0, 
                'state': 0, 
                'city': 0
              }
            }
          ]

          if (page) {
            codePipeline.push({
                '$skip': skip
            })
        }
          if (limit) {
            codePipeline.push({
                '$limit': limit
            })
        }
           
            codeData = await PostalCode.aggregate(codePipeline)
            codeDataCount = await PostalCode.countDocuments(codeQuery)

        if (codeData.length > 0) {

            totalPages = Math.ceil(codeDataCount / limit);
            successData.codeData = codeData;
            successData.codeDataCount = codeDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

            responseData.sendResponse(res, "Postal code Data", successData)
        } else {
            responseData.sendMessage(res, "Postalcode not found", successData.codeData)
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updateCode = async (req, res) => {
    try {
        const codeExist = await PostalCode.findOne({ _id: req.params.codeId , is_deleted:false})

        if (codeExist) {
            const updateCode = await PostalCode.findByIdAndUpdate({ _id: req.params.codeId }, req.body)

            if (updateCode) {
                const result = await PostalCode.aggregate([

                    {
                        '$match': { 
                        '_id': new mongoose.Types.ObjectId(codeExist._id) 
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
                    },{
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
                        '$addFields': {
                            'country_name': '$country.country_name',
                            'state_name': '$state.state_name',
                            'city_name': '$city.city_name'
                        }
                    },
                    {
                        '$project': {
                            'country': 0,
                            'state': 0,
                            'city': 0,
                        }
                    }
                    
                      ])
                responseData.sendResponse(res, "PostalCode updated successfully", result)
            } else {
                responseData.errorResponse(res, "PostalCode update failed!")
            }
        } else {
            responseData.sendMessage(res, "PostalCode not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const inactivateCode = async (req, res) => {
    try {
        const codeExist = await PostalCode.findOne({ _id: req.params.codeId })

        if (codeExist) {
            const updateCode = await PostalCode.findByIdAndUpdate({ _id: req.params.codeId }, { is_active: false })

            if (updateCode) {
                responseData.sendResponse(res, "PostalCode inactivated")
            } else {
                responseData.errorResponse(res, "PostalCode inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "PostalCode not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deleteCode = async (req, res) => {
    try {
        const codeExist = await PostalCode.findOne({ _id: req.params.codeId,is_deleted:false })

        if (codeExist) {
            const updateCode = await PostalCode.findByIdAndUpdate({ _id: req.params.codeId }, { is_active: false, is_deleted: true, deletedAt: new Date() })

            if (updateCode) {
                responseData.sendResponse(res, "PostalCode deleted successfully")
            } else {
                responseData.errorResponse(res, "PostalCode inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "PostalCode not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getCodeByCityId = async (req, res) => {

    try {
        const codeByCityId = await PostalCode.aggregate([

            {
                '$match': { 
                'city_id': new mongoose.Types.ObjectId(req.params.cityId),
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
            },{
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
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                }
            }
            
              ])

        if (codeByCityId.length > 0) {
            responseData.sendResponse(res, "PostalCode Data", codeByCityId)
        } else {
            responseData.sendMessage(res, "PostalCode not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const getCodeById = async (req, res) => {

    try {
        const codeById = await PostalCode.aggregate([

            {
                '$match': { 
                '_id': new mongoose.Types.ObjectId(req.params.codeId),
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
            },{
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
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                }
            }
            
              ])

        if (codeById) {
            responseData.sendResponse(res, "Postal code Data", codeById)
        } else {
            responseData.sendMessage(res, "Postalcode not found", codeById)
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }

}

const downloadCodeData = async (req, res) => {
    try {

        let codeQuery;
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let codeData;
        let codeDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                codeQuery = { is_active: true, is_deleted: false }

            } else if (req.query.active == 'false') {
                codeQuery = { is_active: false, is_deleted: false }

            } else {
                codeQuery = { is_deleted: false }
            }
            
            if(req.query.search){
                const searchItem = req.query.search;
                
                const codePattern = /^[1-9][0-9]{5}$/ ;
                const validcode = codePattern.test(searchItem);
                codeQuery = validcode ? { postal_code: Number (searchItem) } : {};
            }

        let codePipeline = [

            {
                '$match': codeQuery
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
            },{
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
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name',
                    'city_name': '$city.city_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                    'city': 0,
                }
            },
            {
                '$sort': {
                    createdAt: -1
                }
            }
              ]

              if(page){
                codePipeline.push({
                    '$skip': skip
                })
            }
            if(limit){
                codePipeline.push({
                    '$limit': limit
                })
            }
           
            codeData = await PostalCode.aggregate(codePipeline).exec()
            codeDataCount = await PostalCode.countDocuments(codeQuery)

            totalPages = Math.ceil(codeDataCount / limit);
            successData.codeData = codeData;
            successData.codeDataCount = codeDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

            if (codeData.length == 0) {
                responseData.sendMessage(res, "Postalcode not found", codeData)
        } else {
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'Postalcode Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'country_name', key: 'country_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'state_name', key: 'state_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'city_name', key: 'city_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'postal_code', key: 'postal_code', width: 30, horizontalCentered : true, verticalCentered: true},
    ];

      // eslint-disable-next-line guard-for-in
      for (i in codeData) {
        worksheet.addRow(codeData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'Postalcode_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/Postalcode_Data.xlsx`;

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


module.exports = { postCode, getAllCodes, updateCode, inactivateCode, deleteCode, getCodeByCityId, getCodeById, downloadCodeData }
