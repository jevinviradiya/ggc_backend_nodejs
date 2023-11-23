const {createCategory, getAllCategory, updateCategoryById, deleteCategoryById, getCategoryById} = require('../../controller/Business/categoryController')
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const categoryRoute = (app) => {  
    app.post('/create-category',verifyToken, checkRolePermission(['Business Category', 'is_read']), createCategory)
    app.get('/get-all-category', getAllCategory)
    app.get('/category-by-id/:categoryId',  getCategoryById)
    app.put('/update/:categoryId',verifyToken, checkRolePermission(['Business Category', 'is_edit']), updateCategoryById)
    app.delete('/delete/:categoryId',verifyToken, checkRolePermission(['Business Category', 'is_delete']), deleteCategoryById)
}

module.exports =  categoryRoute;
