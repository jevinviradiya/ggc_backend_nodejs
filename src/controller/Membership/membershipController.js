const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { membershipValidation } = require('../../validations/membershipValidation');
const Membership = models.membership;
const Transaction = models.transaction;
const excelJS = require('exceljs');
const path = require('path');

//Create Membership 
const createMembership = async (req, res) => {

    try {

        const mshipValidate = await membershipValidation.createMembership(req.body);

        if(mshipValidate.error){
            return responseData.errorResponse(res, mshipValidate.error.details[0].message);
        }
 
                  const createMemship = await Membership.create(req.body);
                  createMemship.save();
                  if(createMemship){

                     return  responseData.sendResponse(
                        res,
                        'Membership created successfully!',
                        createMemship
                    );       
             
                   }else{
                     return responseData.errorResponse(res, 'Create membership failed!');
                   }
        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Get all memberships
const getMemberships = async (req,res) => {
    
    try {
        
        let query =  {is_deleted : false };
        if(req.query.search){
            const searchItem = req.query.search;
            const nameQuery = { membership_name: { $regex: searchItem, $options: 'i' } || {}, is_deleted:false};
            query = {
                $or: [nameQuery]
            }

        }
        
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let membershipData;
        let membershipDataCount;
        let totalPages;
        let currentPage;
        let successData = {}
        
        
        membershipData = await Membership.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }).exec();
        membershipDataCount = await Membership.countDocuments(query);
        
        totalPages = Math.ceil(membershipDataCount / limit);
        successData.membershipData = membershipData;
        successData.membershipDataCount = membershipDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
        
        if(membershipData.length > 0) {
            responseData.sendResponse(
                res,
                'Membership Details' ,
                successData
            )
        }else{
            responseData.sendMessage(res, "Membership not found", successData.membershipData)
        }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Update membership
const updateMembershipById  = async (req,res) => {
    try {

        const mshipValidate = await membershipValidation.updateMembership(req.body);

        if(mshipValidate.error){
            return responseData.errorResponse(res, mshipValidate.error.details[0].message);
        }

        const msExist = await Membership.find({_id: req.params.membershipId, is_deleted: false})

        if(msExist){

            const msUpdate = await Membership.findByIdAndUpdate({_id: req.params.membershipId}, req.body)

            if(msUpdate){

          const ms = await Membership.find({_id: req.params.membershipId})

            responseData.sendResponse(
                res,
                'Membership updated successfully!' ,
                ms
            )
            }else{
          responseData.errorResponse(res, 'Membership update failed!');

            }
        }else{
         responseData.sendMessage(res, 'Membership not found!', []);
        }
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
    
}

//Delete membership
const deleteMembershipById = async (req, res) => {
    try {
        

        const msExist = await Membership.find({_id: req.params.membershipId, is_deleted: false})

        if (msExist) {

            const deletems = await Membership.findByIdAndUpdate({ _id: req.params.membershipId }, { is_deleted: true,  deletedAt: new Date() })

            if (deletems) {
                responseData.sendResponse(
                    res,
                    'Membership deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Membership delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Membership not found!', []);
        }

   
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get membership by id
const getMembershipById = async (req, res) => {
    try {

        const msExist = await Membership.find({_id: req.params.membershipId, is_deleted: false})

        if (msExist) {

                responseData.sendResponse(
                    res,
                    'Membership Details',
                    msExist
                )
           
        } else {
            responseData.sendMessage(res, 'Membership not found!', []);
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//download data
const downloadMembershipData = async (req, res) => {
    try {
        
        let query =  {is_deleted : false };
        if(req.query.search){
            const searchItem = req.query.search;
            const nameQuery = { membership_name: { $regex: searchItem, $options: 'i' } || {}, is_deleted:false};
            query = {
                $or: [nameQuery]
            }

        }
        
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let membershipData;
        let membershipDataCount;
        let totalPages;
        let currentPage;
        let successData = {}
        
        
        membershipData = await Membership.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }).exec();
        membershipDataCount = await Membership.countDocuments(query);
        
        totalPages = Math.ceil(membershipDataCount / limit);
        successData.membershipData = membershipData;
        successData.membershipDataCount = membershipDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
        
        if(membershipData.length == 0) {
      responseData.sendMessage(res, 'Membership not found', membershipData );
        
        }else{
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'Membership Data';
      const worksheet = workbook.addWorksheet(sheetName);  // New Worksheet


      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'membership_name', key: 'membership_name', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'min_range_amount', key: 'min_range_amount', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'max_range_amount', key: 'max_range_amount', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'range_type', key: 'range_type', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'monthly_price', key: 'monthly_price', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'yearly_price', key: 'yearly_price', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'discount', key: 'discount', width: 20, horizontalCentered : true, verticalCentered: true},
        {header: 'description', key: 'description', width: 40, horizontalCentered : true, verticalCentered: true},
        {header: 'purchased_by', key: 'purchased_by', width: 40, horizontalCentered : true, verticalCentered: true}
    ];

      // eslint-disable-next-line guard-for-in
      for (i in membershipData) {
        worksheet.addRow(membershipData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'Membership_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/Membership_Data.xlsx`;

        responseData.sendResponse(res, 'Url for download data', downloadUrl);
      })
          .catch((err) => {
            responseData.sendMessage(res, 'Error creating Excel file:', err);
          });
    
        }
    } catch (error) {
      helper.logger.error(error);
      responseData.errorResponse(res, error);
    }
}

// purchase membership 
const purchaseMembership = async (req, res) => {
    try {
        const { membership_id, amount } = req.body;

            await Membership.findByIdAndUpdate( {_id: membership_id}, { $push : { purchased_by : new mongoose.Types.ObjectId(req.user._id)}} )

            await User.findByIdAndUpdate({_id : req.user._id}, {$set: {membership_id : membership_id}})

            var instance = new Razorpay({
                key_id:  process.env.RAZORPAY_ID,
                key_secret: process.env.RAZORPAY_KEY,
              });
            
              var options = {
                amount: req.body.amount,  // amount in the smallest currency unit
                currency: req.body.currency,
                receipt: req.body.receipt
              };

              //create an order in razorpay

              instance.orders.create(options, async function(err, order) {
                console.log(order);

                // create transaction table entry
                
                let transactionInfo = {
                    user_id : req.user._id ,
                    closing_balance : amount, 
                    amount : amount
                }
                let transactionUpdate = await Transaction.create(transactionInfo);

                if(transactionUpdate){
                    responseData.sendResponse(res, 'Membership purchased successfully');
                }else{
                    responseData.errorResponse(res, 'Transaction data store failed!');
                }

              });

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, error);
    }
}

module.exports = {createMembership, getMemberships, updateMembershipById, deleteMembershipById, getMembershipById, downloadMembershipData, purchaseMembership}
