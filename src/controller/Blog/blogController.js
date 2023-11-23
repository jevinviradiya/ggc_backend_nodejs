const models = require('../../model/index');
const Blog = models.blog
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
const { mongoose } = require('../../config/dbConnection');
const excelJS = require('exceljs');
const path = require('path');

const registerBlog = async (req, res) => {
    try {
        

        const { title, description } = req.body

        let blogInfo = req.body;
        blogInfo.created_by = req.user._id;
        blogInfo.title = title;
        blogInfo.description = description;


    const regblog = await Blog.create(blogInfo);

    if(regblog){


        let blogData = await Blog.aggregate([
           { '$match': { '_id': new mongoose.Types.ObjectId(regblog) } },
           {
            '$lookup': {
              'from': 'users', 
              'localField': 'created_by', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          },{
            '$addFields': {
              'user_name': '$user.first_name'
            }
        },{
            '$project': {
                user: 0
            }
        }
        ])
        responseData.sendResponse(res, "Blog created successfully!", blogData)
    }else{
        responseData.errorResponse(res, 'Blog data store failed!');
    }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getAllBlogs = async (req, res) => {
    try {

        let blogQuery = { is_deleted: false }
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let blogData;
        let blogDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        const queryStatus = req.query.active;

        if (queryStatus && queryStatus == 'true') {
            blogQuery = { is_active: 'true', is_deleted: false }

        } else if (queryStatus == 'false') {
            blogQuery = { status: 'false', is_deleted: false }

        } 
        if(req.query.search){
            let searchItem = req.query.search;
            const nameQuery = { title: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false };
            blogQuery = nameQuery;
        }

        blogData = await Blog.find(blogQuery).limit(limit).skip(skip).sort({ createdAt: -1 })
        blogDataCount = await Blog.countDocuments(blogQuery)


        totalPages = Math.ceil(blogDataCount / limit);
        successData.blogData = blogData;
        successData.blogDataCount = blogDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;
      
       if (blogData.length > 0) {
            responseData.sendResponse(res, "Blog data !", successData)
        } else {
            responseData.sendMessage(res, 'Blog data not found!', blogData);
        }


} catch (error) {
    helper.logger.error(error);
    responseData.errorResponse(res, 'Something went wrong!');
}
}

const getBlogById = async (req, res) => {
    try {

        const blogData = await Blog.find({_id : req.params.blogId})

        if(blogData.length > 0 ){
        responseData.sendResponse(res, "Blog Data", blogData)
        }else{
        responseData.sendMessage(res, 'Blog data not found!', blogData);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const getBlogByUserId = async (req, res) => {
    try {

        const blogData = await Blog.find({created_by : req.params.userId})

        if(blogData.length > 0 ){
        responseData.sendResponse(res, "Blog Data", blogData)
        }else{
        responseData.sendMessage(res, 'Blog data not found!', blogData);
        }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const updateBlogData = async (req, res) => {
    try {
       const blogExist = await Blog.findOne({_id: req.params.blogId}) 

       if(!blogExist){
        responseData.sendMessage(res, 'Blog data not found!', []);
       }

       const updateData = await Blog.findByIdAndUpdate({_id: req.params.blogId}, req.body)

       if(updateData){
        const blogData = await Blog.findOne({_id: blogExist._id}) 
        responseData.sendResponse(res, "Blog Data updated successfully!", blogData)

       }else{
        responseData.errorResponse(res, 'Blog data update failed!');
       }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const deleteBlogData = async (req, res) => {
    try {
       const blogExist = await Blog.findOne({_id: req.params.blogId}) 

       if(!blogExist){
        responseData.sendMessage(res, 'Blog data not found!', []);
       }

       const updateData = await Blog.findByIdAndUpdate({_id: req.params.blogId}, {is_active: false, is_deleted: true, deletedAt : new Date()})
       
       if(updateData){
           responseData.sendResponse(res, "Blog Data deleted successfully!")
       }else{
        responseData.errorResponse(res, 'Blog Data delete failed!');
       }

    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

const downloadBlogData = async (req, res) => {
    try {

        let blogQuery = { is_deleted: false }
        const page = parseInt(req.query.page) ;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        let blogData;
        let blogDataCount;
        let totalPages;
        let currentPage;
        let successData = {};


        const queryStatus = req.query.active;

        if (queryStatus && queryStatus == 'true') {
            blogQuery = { is_active: 'true', is_deleted: false }

        } else if (queryStatus == 'false') {
            blogQuery = { status: 'false', is_deleted: false }

        } 

        blogData = await Blog.find(blogQuery).limit(limit).skip(skip).sort({ createdAt: -1 })
        blogDataCount = await Blog.countDocuments(blogQuery)


        totalPages = Math.ceil(blogDataCount / limit);
        successData.blogData = blogData;
        successData.blogDataCount = blogDataCount;
        successData.currentPage = page;
        successData.limit = limit;
        successData.totalPages = totalPages;

        if (blogData.length == 0) {
            responseData.sendMessage(res, "Blog data not found", blogData)
        } else {
            
      const workbook = new excelJS.Workbook();
      const sheetName = 'Request Blog Data';
      const worksheet = workbook.addWorksheet(sheetName); // New Worksheet
    

      worksheet.columns = [
        {header: '_id', key: '_id', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'title', key: 'title', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'created_by', key: 'created_by', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'description', key: 'description', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'createdAt', key: 'createdAt', width: 30, horizontalCentered : true, verticalCentered: true},
        {header: 'updatedAt', key: 'updatedAt', width: 30, horizontalCentered : true, verticalCentered: true},
    ];

      // eslint-disable-next-line guard-for-in
      for (i in blogData) {
        worksheet.addRow(blogData[i]);
      }

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = {bold: true};
      });

      const filePath = path.join(__dirname,'../../../public/files', 'Blog_Data.xlsx');
 
      workbook.xlsx.writeFile(filePath).then(() => {
        const downloadUrl = `${process.env.IMG_PATH}public/files/Blog_Data.xlsx`;

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

module.exports = {registerBlog, getAllBlogs, getBlogById, getBlogByUserId, updateBlogData, deleteBlogData, downloadBlogData}