const models = require('../../model/index');
const City = models.city
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const excelJS = require('exceljs');
const path = require('path');
const { mongoose } = require('../../config/dbConnection');

const postCity = async (req, res) => {
    try {

        const CityExist = await City.findOne({ city_name: { $regex: req.body.city_name, $options: 'i'},  is_deleted: false})

        if (CityExist) {
            return responseData.errorResponse(res, "City already Exist")
        }

        const cityData = await City.create(req.body)
        cityData.save();

        if (cityData) {

            let cityInfo = await City.aggregate([

                {
                    '$match': {
                        '_id' : new mongoose.Types.ObjectId(cityData._id)
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
                },
                {
                    '$addFields': {
                        'country_name': '$country.country_name',
                        'state_name': '$state.state_name'
                    }
                },
                {
                    '$project': {
                        'country': 0,
                        'state': 0,
                    }
                } 
                  ])


            responseData.sendResponse(res, "City Stored Successfully!", cityInfo)
        } else {
            responseData.errorResponse(res, "City Store failed!")
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllCities = async (req, res) => {
    try {

        let cityQuery = { is_deleted: false };
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let cityData;
        let cityDataCount;
        let totalPages;
        let currentPage;
        let successData = {};
        let cityPipeline =[];

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                cityQuery = Object.assign(cityQuery, { is_active: true})

            } 
            else if (activeStatus == 'false') {
                cityQuery = Object.assign(cityQuery, { is_active: false})

            }
            
            if(req.query.search){
                const searchItem = req.query.search;

                const nameQuery = { city_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                cityQuery = Object.assign(cityQuery, { $or: [nameQuery] });
            }

            //not waiting for pipeline

            cityPipeline = [
                
                {
                  '$match': cityQuery
                },
                 {
                  '$lookup': {
                    'from': 'countries', 
                    'localField': 'country_id', 
                    'foreignField': '_id', 
                    'as': 'country'
                  }
                },
                {
                    '$unwind':{
                        'path':'$country'
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
                    '$addFields': {
                      'country_name': '$country.country_name', 
                      'state_name': '$state.state_name' 
                    }
                  },
                  {
                      '$project':{
                          'country': 0,
                          'state':0
                      }
                  },
              
        ]

        if (page) {
            cityPipeline.push({
                '$skip': skip
            })
        }
        if (limit) {
            cityPipeline.push({
                '$limit': limit
            })
        }
       
            cityData = await City.aggregate(cityPipeline);
            cityDataCount = await City.countDocuments(cityQuery)

        if (cityData.length > 0) {

            totalPages = Math.ceil(cityDataCount / limit);
            successData.cityData = cityData;
            successData.cityDataCount = cityDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

            responseData.sendResponse(res, "City Data", successData)
        } else {
            responseData.sendMessage(res, "City not found", cityData)
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updateCity = async (req, res) => {
    try {
        const CityExist = await City.findOne({ _id: req.params.cityId , is_deleted:false})

        if (CityExist) {
            const updateCity = await City.findByIdAndUpdate({ _id: req.params.cityId }, req.body)

            if (updateCity) {
                const result = await City.aggregate([

                    {
                        '$match': {
                            '_id' : new mongoose.Types.ObjectId(CityExist._id)
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
                    },
                    {
                        '$addFields': {
                            'country_name': '$country.country_name',
                            'state_name': '$state.state_name'
                        }
                    },
                    {
                        '$project': {
                            'country': 0,
                            'state': 0,
                        }
                    } 
                      ])
                responseData.sendResponse(res, "City updated successfully", result)
            } else {
                responseData.errorResponse(res, "City update failed!")
            }
        } else {
            responseData.errorResponse(res, "City not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const inactiveCity = async (req, res) => {
    try {
        const CityExist = await City.findOne({ _id: req.params.cityId, is_deleted: false, is_active: true})

        if (CityExist) {
            const updateCity = await City.findByIdAndUpdate({ _id: req.params.cityId }, { is_active: false })

            if (updateCity) {
                responseData.sendResponse(res, "City inactivated")
            } else {
                responseData.errorResponse(res, "City inactivate failed!")
            }
        } else {
            responseData.errorResponse(res, "City not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deleteCity = async (req, res) => {
    try {
        const CityExist = await City.findOne({ _id: req.params.cityId , is_deleted:false})

        if (CityExist) {
            const updateCity = await City.findByIdAndUpdate({ _id: req.params.cityId }, { is_active: false, is_deleted: true, deletedAt: new Date() })

            if (updateCity) {
                responseData.sendResponse(res, "City deleted successfully")
            } else {
                responseData.errorResponse(res, "City inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "City not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getCityByStateId = async (req, res) => {

    try {
       
        const cityByStateId = await City.aggregate([

            {
                '$match': {
                    'state_id' : new mongoose.Types.ObjectId(req.params.stateId)
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
            },
            {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                }
            } 
              ])

        if (cityByStateId) {
            responseData.sendResponse(res, "City Data", cityByStateId)
        } else {
            responseData.sendMessage(res, "City not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const getCityById = async (req, res) => {

    try {
        const cityById = await City.aggregate([

            {
                '$match': {
                    '_id' : new mongoose.Types.ObjectId(req.params.cityId)
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
            },
            {
                '$addFields': {
                    'country_name': '$country.country_name',
                    'state_name': '$state.state_name'
                }
            },
            {
                '$project': {
                    'country': 0,
                    'state': 0,
                }
            } 
              ])

        if (cityById) {
            responseData.sendResponse(res, "City Data", cityById)
        } else {
            responseData.sendMessage(res, "City not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const downloadCityData = async (req, res) => {
    try {

        let cityQuery = { is_deleted: false };
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let cityData;
        let cityDataCount;
        let totalPages;
        let currentPage;
        let successData = {};
        let cityPipeline =[];

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                cityQuery = Object.assign(cityQuery, { is_active: true})

            } 
            else if (activeStatus == 'false') {
                cityQuery = Object.assign(cityQuery, { is_active: false})

            }
            
            if(req.query.search){
                const searchItem = req.query.search;

                const nameQuery = { city_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                cityQuery = Object.assign(cityQuery, { $or: [nameQuery] });
            }

            //not waiting for pipeline

            cityPipeline = [
                
                {
                  '$match': cityQuery
                },
                 {
                  '$lookup': {
                    'from': 'countries', 
                    'localField': 'country_id', 
                    'foreignField': '_id', 
                    'as': 'country'
                  }
                },
                {
                    '$unwind':{
                        'path':'$country'
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
                    '$addFields': {
                      'country_name': '$country.country_name', 
                      'state_name': '$state.state_name' 
                    }
                  },
                  {
                      '$project':{
                          'country': 0,
                          'state':0
                      }
                  },
              
        ]

        if (page) {
            cityPipeline.push({
                '$skip': skip
            })
        }
        if (limit) {
            cityPipeline.push({
                '$limit': limit
            })
        }
       
            cityData = await City.aggregate(cityPipeline);
            cityDataCount = await City.countDocuments(cityQuery)

            totalPages = Math.ceil(cityDataCount / limit);
            successData.cityData = cityData;
            successData.cityDataCount = cityDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

        if (cityData.length == 0) {
            responseData.sendMessage(res, "City not found", cityData)
        } else {
           
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'City Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'city_name', key: 'city_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'state_name', key: 'state_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'country_name', key: 'country_name', width: 30, horizontalCentered : true, verticalCentered: true}
    ];

      // eslint-disable-next-line guard-for-in
      for (i in cityData) {
        worksheet.addRow(cityData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'City_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/City_Data.xlsx`;

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

module.exports = { postCity, getAllCities, updateCity, inactiveCity, deleteCity, getCityByStateId, getCityById, downloadCityData }
