const models = require('../../model/index');
const Payment = models.payment
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');

const registerPayment = async (req, res) => {
    try {
        const { request_id, payment_by, amount, currency, status } = req.body
        let paymentInfo = {} ;

        if(req.body.payment_by == 'Cheque'){
            paymentInfo.cheque_number = req.body.cheque_number;
            paymentInfo.cheque_date = req.body.cheque_date;
            paymentInfo.account_holder_name = req.body.account_holder_name;
            paymentInfo.account_holder_bank = req.body.account_holder_bank;
            paymentInfo.bank_branch = req.body.bank_branch;
        } else if(req.body.payment_by == 'UPI'){
            paymentInfo.upi = req.body.upi;
        }
        
        paymentInfo.created_by = req.user._id;
        paymentInfo.request_id = request_id;
        paymentInfo.payment_by = payment_by;
        paymentInfo.amount = amount;
        paymentInfo.currency = currency;
        paymentInfo.status = status;
        
        
    const regPayment = await Payment.create(paymentInfo);

    if(regPayment){
        responseData.sendResponse(res, "Payment data stored successfully!", regPayment)
    }else{
        responseData.errorResponse(res, 'Payment data store failed!');
    }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllPayments = async (req, res) => {
    try {

        let paymentQuery = {is_deleted : false};
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let paymentData;
        let paymentDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        const queryStatus = req.query.status;

        if (queryStatus && queryStatus == 'Done') {
            paymentQuery = Object.assign(paymentQuery, { status: 'Done'})

        } else if (queryStatus == 'Pending') {
            paymentQuery = Object.assign(paymentQuery, { status: 'Pending'})

        }

        paymentData = await Payment.find(paymentQuery).limit(limit).skip(skip).sort({ createdAt: -1 })
        paymentDataCount = await Payment.countDocuments(paymentQuery)


        totalPages = Math.ceil(paymentDataCount / limit);
        successData.paymentData = paymentData;
        successData.paymentDataCount = paymentDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
      
       if (paymentData.length > 0) {
            responseData.sendResponse(res, "Payment data!", successData)
        } else {
            responseData.sendMessage(res, 'Payment data not found', paymentData);
        }


} catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
}
}

const getPaymentById = async (req, res) => {
    try {

        const paymentData = await Payment.findOne({_id : req.params.paymentId})

        if(paymentData){
        responseData.sendResponse(res, "Payment Data", paymentData)
        }else{
        responseData.sendMessage(res, 'Payment data not found!', paymentData );
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getPaymentByRequestId = async (req, res) => {
    try {

        const paymentData = await Payment.findOne({request_id : req.params.requestId})

        if(paymentData){
        responseData.sendResponse(res, "Payment Data", paymentData)
        }else{
        responseData.sendMessage(res, 'Payment data not found!', paymentData );
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updatePaymentData = async (req, res) => {
    try {
       const paymentExist = await Payment.findOne({_id: req.params.paymentId}) 

       if(!paymentExist){
        responseData.sendMessage(res, 'Payment data not found!', []);
       }

       const updateData = await Payment.findByIdAndUpdate({_id: req.params.paymentId}, req.body)

       if(updateData){
        const paymentData = await Payment.findOne({_id: paymentExist._id}) 
        responseData.sendResponse(res, "Payment Data updated successfully!", paymentData)

       }else{
        responseData.errorResponse(res, 'Payment data update failed!');
       }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deletePaymentData = async (req, res) => {
    try {
       const paymentExist = await Payment.findOne({_id: req.params.paymentId}) 

       if(!paymentExist){
        responseData.sendMessage(res, 'Payment data not found!', []);
       }

       const updateData = await Payment.findByIdAndUpdate({_id: req.params.paymentId}, {is_deleted: true, deletedAt : new Date()})
       
       if(updateData){
           responseData.sendResponse(res, "Payment Data deleted successfully!")
       }else{
        responseData.errorResponse(res, 'Payment Data delete failed!');
       }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const downloadPaymentData = async (req, res) => {
    try {

        let paymentQuery = {is_deleted :false};
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let paymentData;
        let paymentDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        const queryStatus = req.query.status;

        if (queryStatus && queryStatus == 'Done') {
            paymentQuery = Object.assign(paymentQuery, { status: 'Done'})

        } else if (queryStatus == 'Pending') {
            paymentQuery = Object.assign(paymentQuery, { status: 'Pending'})

        } else {
            paymentQuery = { is_deleted: false }
        }

        paymentData = await Payment.find(paymentQuery)
        paymentDataCount = await Payment.countDocuments(paymentQuery)


        totalPages = Math.ceil(paymentDataCount / limit);
        successData.paymentData = paymentData;
        successData.paymentDataCount = paymentDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;

        if (paymentData.length == 0) {
            responseData.sendMessage(res, "Payment data not found", paymentData)
        } else {
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'Request Payment Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'request_id', key: 'request_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'created_by', key: 'created_by', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'payment_by', key: 'payment_by', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'amount', key: 'amount', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'currency', key: 'currency', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'status', key: 'status', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'payment_date', key: 'payment_date', width: 30, horizontalCentered : true, verticalCentered: true},
    ];

      // eslint-disable-next-line guard-for-in
      for (i in paymentData) {
        worksheet.addRow(paymentData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'RequestPayment_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/RequestPayment_Data.xlsx`;

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

module.exports = {registerPayment, getAllPayments, getPaymentByRequestId, updatePaymentData, deletePaymentData, getPaymentById, downloadPaymentData}
