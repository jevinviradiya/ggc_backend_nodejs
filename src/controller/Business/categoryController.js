const models = require('../../model/index');
const helper = require('../../helper/helper-function');
const responseData = require('../../helper/response');
// const { categoryValidation } = require('../../validations/categoryValidation');
const Category = models.businessCategory;

//Create Category 
const createCategory = async (req, res) => {

    try {

        const ctgExist = await Category.findOne({ category_name: { $regex: req.body.category_name, $options: 'i'},  is_deleted: false})

        if(ctgExist){
          return  responseData.errorResponse(res, 'Category already exist!');
        }

                  const categoryInfo = await Category.create(req.body);
                  categoryInfo.save();
                  if(categoryInfo){

                     return  responseData.sendResponse(
                        res,
                        'Category created successfully!',
                        categoryInfo
                    );       
                 
                   }else{
                     return responseData.errorResponse(res, 'Create Category failed!');
                   }

        
    } catch (error) {
         helper.logger.error(error);
         responseData.errorResponse(res, 'Something went wrong!');
    }

}

//Get all categories
const getAllCategory = async (req,res) => {
    
    try {
        
        let query =  {};
        if(req.query.search){
            const searchItem = req.query.search;
            const nameQuery = { category_name: { $regex: searchItem, $options: 'i' } || {}, is_deleted: false};
    
            query = {
                $or: [nameQuery]
            }

        }else{
            query = {is_deleted: false}
        }
       const categoryData = await Category.find(query)
        if(categoryData) {
            responseData.sendResponse(
                res,
                'Category Details' ,
                categoryData
            )
        }
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Update Category
const updateCategoryById  = async (req,res) => {
    try {

        const ctgExist = await Category.find({_id: req.params.categoryId, is_deleted: false})

        if(ctgExist){

            const ctgUpdate = await Category.findByIdAndUpdate({_id: req.params.categoryId}, req.body)

            if(ctgUpdate){

          const ctg = await Category.find({_id: req.params.categoryId})

            responseData.sendResponse(
                res,
                'Category updated successfully!' ,
                ctg
            )
            }else{
          responseData.errorResponse(res, 'Category update failed!');

            }
        }else{
         responseData.sendMessage(res, 'Category not found!', []);
        }
        
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
    
}

//Delete Category
const deleteCategoryById = async (req, res) => {
    try {
        

        const ctgExist = await Category.find({_id: req.params.categoryId, is_deleted: false})

        if (ctgExist) {

            const deletems = await Category.findByIdAndUpdate({ _id: req.params.categoryId }, { is_deleted: true,  deletedAt: new Date() })

            if (deletems) {
                responseData.sendResponse(
                    res,
                    'Category deleted successfully!',
                )
            } else {
                responseData.sendMessage(
                    res,
                    'Category delete failed!'
                )
            }
        } else {
            responseData.sendMessage(res, 'Category not found!', []);
        }

   
    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

//Get Category by id
const getCategoryById = async (req, res) => {
    try {

        const ctgExist = await Category.find({_id: req.params.categoryId, is_deleted: false})

        if (ctgExist) {

                responseData.sendResponse(
                    res,
                    'Category Details',
                    ctgExist
                )
           
        } else {
            responseData.sendMessage(res, 'Category not found!', [] );
        }


    } catch (error) {
        helper.logger.error(error);
        responseData.errorResponse(res, 'Something went wrong!');
    }
}

module.exports = {createCategory, getAllCategory, updateCategoryById, deleteCategoryById, getCategoryById}