const models = require('../../model/index');
const Country = models.countries
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const excelJS = require('exceljs');
const path = require('path');

const postCountry = async (req, res) => {
    try {

        const CountryExist = await Country.findOne({ country_name: { $regex: req.body.country_name, $options: 'i'},  is_deleted: false})

        if (CountryExist) {
          return  responseData.errorResponse(res, "Country already Exist")
        }
    

        let countryInfo = {}
        countryInfo.country_name = req.body.country_name
        

        const countryData = await Country.create(countryInfo)   
        countryData.save();

        if (countryData) {
            responseData.sendResponse(res, "Country Stored Successfully!", countryData)
        } else {
            responseData.errorResponse(res, "Country Store failed!")
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllCountries = async (req, res) => {
    try {

        let countryQuery = { is_deleted: false };
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let countryData;
        let countryDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                countryQuery = Object.assign(countryQuery, { is_active: true })


            } else if (req.query.active == 'false') {
                countryQuery = Object.assign(countryQuery, { is_active: false })

            }

            if (req.query.search) {
                const searchItem = req.query.search;
    
                const nameQuery = { country_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                countryQuery = Object.assign(countryQuery, { $or: [nameQuery] });
    
            }

            countryData = await Country.find(countryQuery).limit(limit).skip(skip).sort({ createdAt: -1 })
            countryDataCount = await Country.countDocuments(countryQuery)

        if (countryData.length > 0) {

            totalPages = Math.ceil(countryDataCount / limit);
            successData.countryData = countryData;
            successData.countryDataCount = countryDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;

            responseData.sendResponse(res, "Country Data", successData)
        } else {
            responseData.sendMessage(res, "Country not found", successData.countryData)
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updateCountry = async (req, res) => {
    try {
        const CountryExist = await Country.findOne({ _id: req.params.countryId, is_deleted: false })

        if (CountryExist) {

            const updateCountry = await Country.findByIdAndUpdate({ _id: req.params.countryId }, req.body)

            if (updateCountry) {
                const result = await Country.findOne({ _id: req.params.countryId })
                responseData.sendResponse(res, "Country updated successfully", result)
            } else {
                responseData.errorResponse(res, "Country update failed!")
            }
        } else {
            responseData.sendMessage(res, "Country not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const inactiveCountry = async (req, res) => {
    try {
        const CountryExist = await Country.findOne({ _id: req.params.countryId, is_deleted: false, is_active: true })

        if (CountryExist) {
            const updateCountry = await Country.findByIdAndUpdate({ _id: req.params.countryId }, { is_active: false })

            if (updateCountry) {
                responseData.sendResponse(res, "Country inactivated")
            } else {
                responseData.errorResponse(res, "Country inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "Country not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deleteCountry = async (req, res) => {
    try {
        const CountryExist = await Country.findOne({ _id: req.params.countryId, is_deleted: false })

        if (CountryExist) {
            const updateCountry = await Country.findByIdAndUpdate({ _id: req.params.countryId }, { is_active: false, is_deleted: true, deletedAt: new Date() })

            if (updateCountry) {
                responseData.sendResponse(res, "Country deleted successfully")
            } else {
                responseData.errorResponse(res, "Country inactivate failed!")
            }
        } else {
            responseData.sendMessage(res, "Country not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllCountryPhoneCode = async (req, res) => {

    try {
        const countryData = await Country.find({}, { phone_code: 1, id_identity: 1 })

        if (countryData.length > 0) {
            responseData.sendResponse(res, "Country Data", countryData)
        } else {
            responseData.sendMessage(res, "Country not found", countryData )
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }

}

const getCountryById = async (req, res) => {

    try {
        const countryById = await Country.findOne({ _id: req.params.countryId, is_deleted: false })

        if (countryById) {
            responseData.sendResponse(res, "Country Data", countryById)
        } else {
            responseData.sendMessage(res, "Country not found", [])
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }


}

const downloadCountryData = async (req, res) => {
    try {

        let countryQuery = { is_deleted: false };
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let countryData;
        let countryDataCount;
        let totalPages;
        let currentPage;
        let successData = {};

            const activeStatus = req.query.active;

            if (activeStatus && activeStatus == 'true') {
                countryQuery = Object.assign(countryQuery, { is_active: true})


            } else if (req.query.active == 'false') {
                countryQuery = Object.assign(countryQuery, { is_active: false})

            }

            if (req.query.search) {
                const searchItem = req.query.search;
    
                const nameQuery = { country_name: { $regex: searchItem, $options: 'i' } || {},  is_deleted: false };
                countryQuery = Object.assign(countryQuery, { $or: [nameQuery] });
    
            }

            countryData = await Country.find(countryQuery).limit(limit).skip(skip).sort({ createdAt: -1 })
            countryDataCount = await Country.countDocuments(countryQuery)

            totalPages = Math.ceil(countryDataCount / limit);
            successData.countryData = countryData;
            successData.countryDataCount = countryDataCount;
            successData.currentPage = page;
            successData.limit = limit;
            successData.totalPages = totalPages;
       
            if (countryData.length == 0) {
                responseData.sendMessage(res, "Country not found", countryData)
        } else {
           
        const workbook = new excelJS.Workbook();
        const sheetName = 'Country Data';
        const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
      
  
        worksheet.columns = [
          {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'country_name', key: 'country_name', width: 35, horizontalCentered : true, verticalCentered: true},
          {header: 'short_name', key: 'short_name', width: 30, horizontalCentered : true, verticalCentered: true},
          {header: 'phone_code', key: 'phone_code', width: 30, horizontalCentered : true, verticalCentered: true},
        ];
  
        // eslint-disable-next-line guard-for-in
        for (i in countryData) {
          worksheet.addRow(countryData[i]);
        }
  
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = {bold: true};
        });
  
        const filePath = path.join(__dirname,'../../../public/files', 'Country_Data.xlsx');
   
        workbook.xlsx.writeFile(filePath).then(() => {
          const downloadUrl = `${process.env.IMG_PATH}public/files/Country_Data.xlsx`;
  
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

module.exports = { postCountry, updateCountry, inactiveCountry, getAllCountries, deleteCountry, getAllCountryPhoneCode, getCountryById , downloadCountryData }
