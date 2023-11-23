const {registerBlog, getAllBlogs, getBlogById, getBlogByUserId, updateBlogData, deleteBlogData, downloadBlogData} = require('../../controller/Blog/blogController');
const {verifyToken} = require('../../middleware/verifyToken');
const { checkRolePermission } = require('../../middleware/verifyRole');


const blogRoute = (app) => {
    app.post('/create-blog',verifyToken, checkRolePermission(['Blog', 'is_add']),  registerBlog);
    app.get('/all-blog',verifyToken, checkRolePermission(['Blog', 'is_read']), getAllBlogs);
    app.put('/update-blog/:blogId',verifyToken, checkRolePermission(['Blog', 'is_edit']), updateBlogData);
    app.delete('/delete-blog/:blogId',verifyToken, checkRolePermission(['Blog', 'is_delete']), deleteBlogData);
    app.get('/blog-by-user-id/:userId',verifyToken, checkRolePermission(['Blog', 'is_read']), getBlogByUserId);
    app.get('/blog-by-id/:blogId',verifyToken, checkRolePermission(['Blog', 'is_read']), getBlogById);
    app.get('/download-data',verifyToken, checkRolePermission(['Blog', 'is_read']), downloadBlogData);

}

module.exports =  blogRoute;