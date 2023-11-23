const models = require('../../model/index');
const State = models.state
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');

const postState = async (req, res) => {
    try {

        const StateExist = await State.findOne({ state_name: { $regex: req.body.state_name, $options: 'i'},  is_deleted: false})
        if (StateExist) {
           return responseData.errorResponse(res, "State already Exist")
        }

        const stateData = await State.create(req.body)
        stateData.save();

        if (stateData) {

            let stateInfo = await State.aggregate([

                {
                    '$match': {
                        '_id': new mongoose.Types.ObjectId(stateData._id)
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
                  '$addFields': {
                    'country_name': '$country.country_name', 
                  }
                },
                {
                    '$project':{
                        'country': 0
                    }
                }
            ])

            responseData.sendResponse(res, "State Stored Successfully!", stateInfo)
        } else {
            responseData.errorResponse(res, "State Store failed!")
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllStates = async (req, res) => {
    try {

        let stateQuery;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let stateData;
        let stateDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                stateQuery = { is_active: true, is_deleted: false }


            } else if (req.query.active == 'false') {
                stateQuery = { is_active: false, is_deleted: false }

            } else {
                stateQuery = { is_deleted: false }
            }

            if (req.query.search) {
                const searchItem = req.query.search;
    
                const nameQuery = { state_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                stateQuery = { $or: [nameQuery] };
    
            }

            let statePipeline = [

                {
                    '$match': stateQuery
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
                  '$addFields': {
                    'country_name': '$country.country_name', 
                  }
                },
                {
                    '$project':{
                        'country': 0
                    }
                },
                {
                    '$sort': {
                      createdAt: -1
                    }
                  }
            ]
            stateData =  await State.aggregate(statePipeline).exec()
            stateDataCount = await State.countDocuments(stateQuery)

        if (stateData.length > 0) {

            totalPages = Math.ceil(stateDataCount / limit);
            successData.stateData = stateData;
            successData.stateDataCount = stateDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

            responseData.sendResponse(res, "State Data", successData)
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updateState = async (req, res) => {
    try {
        const stateExist = await State.findOne({ _id: req.params.stateId, is_deleted: false })

        if (stateExist) {
            const updateState = await State.findByIdAndUpdate({ _id: req.params.stateId }, req.body)

            if (updateState) {
                const result = await State.aggregate([

                    {
                        '$match': {
                            '_id': new mongoose.Types.ObjectId(stateExist._id)
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
                      '$addFields': {
                        'country_name': '$country.country_name', 
                      }
                    },
                    {
                        '$project':{
                            'country': 0
                        }
                    }
                ])
                responseData.sendResponse(res, "State updated successfully", result)
            } else {
                responseData.errorResponse(res, "State update failed!")
            }
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const inactiveState = async (req, res) => {
    try {
        const stateExist = await State.findOne({ _id: req.params.stateId, is_deleted: false, is_active: true })

        if (stateExist) {
            const updateState = await State.findByIdAndUpdate({ _id: req.params.stateId }, { is_active: false })

            if (updateState) {
                responseData.sendResponse(res, "State inactivated")
            } else {
                responseData.errorResponse(res, "State inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deleteState = async (req, res) => {
    try {
        const stateExist = await State.findOne({ _id: req.params.stateId, is_deleted: false })

        if (stateExist) {
            const updateState = await State.findByIdAndUpdate({ _id: req.params.stateId }, { is_active: false, is_deleted: true, deletedAt: new Date() })

            if (updateState) {
                responseData.sendResponse(res, "State deleted successfully")
            } else {
                responseData.errorResponse(res, "State inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getStateById = async (req, res) => {

    try {
        const StateById = await State.aggregate([

            {
                '$match': {
                    '_id': new  mongoose.Types.ObjectId(req.params.stateId),
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
            },{
              '$addFields': {
                'country_name': '$country.country_name'
              }
            },
            {
                '$project':{
                    'country': 0
                }
            }
          ])

        if (StateById) {
            responseData.sendResponse(res, "State Data", StateById)
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const getStateByCountryId = async (req, res) => {

    try {
        const StateBycountryId = await State.aggregate([

            {
                '$match': {
                    'country_id': new mongoose.Types.ObjectId(req.params.countryId),
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
            },{
              '$addFields': {
                'country_name': '$country.country_name'
              }
            },
            {
                '$project':{
                    'country': 0
                }
            }
          ])

        if (StateBycountryId) {
            responseData.sendResponse(res, "State Data", StateBycountryId)
        } else {
            responseData.sendMessage(res, "State not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const downloadStateData = async (req, res) => {
    try {

        let stateQuery;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let stateData;
        let stateDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                stateQuery = { is_active: true, is_deleted: false }


            } else if (req.query.active == 'false') {
                stateQuery = { is_active: false, is_deleted: false }

            } else {
                stateQuery = { is_deleted: false }
            }

            if (req.query.search) {
                const searchItem = req.query.search;
    
                const nameQuery = { state_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                stateQuery = { $or: [nameQuery] };
    
            }

            let statePipeline = [

                {
                    '$match': stateQuery
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
                  '$addFields': {
                    'country_name': '$country.country_name', 
                  }
                },
                {
                    '$project':{
                        'country': 0
                    }
                },
                {
                    '$sort': {
                      createdAt: -1
                    }
                  }
            ]
            stateData =  await State.aggregate(statePipeline).exec()
            stateDataCount = await State.countDocuments(stateQuery)
            totalPages = Math.ceil(stateDataCount / limit);
            successData.stateData = stateData;
            successData.stateDataCount = stateDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;
      
            if (stateData.length == 0) {
                responseData.sendMessage(res, "State not found", stateData)

        } else {
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'State Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'state_name', key: 'state_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'country_name', key: 'country_name', width: 30, horizontalCentered : true, verticalCentered: true},
      ];

      // eslint-disable-next-line guard-for-in
      for (i in stateData) {
        worksheet.addRow(stateData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'State_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/State_Data.xlsx`;

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


module.exports = { postState, getAllStates, updateState, inactiveState, deleteState, getStateByCountryId, getStateById, downloadStateData }
