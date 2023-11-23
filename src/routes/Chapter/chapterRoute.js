const { createChapter, getAllChapter, getChapterByChapterId, updateChapterById, updateChapterImage, deleteChapterById, restoreChapters, getUserChapter, chapterStatusUpdate, getChapterBypcId, downloadChapter, finalDeleteChapterById, verifyRefferalCode} = require('../../controller/Chapter/chapterController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');
const { cpUpload } = require('../../middleware/imageUpload');

const chapterRoute = (app) => {
    app.post('/create-chapter', cpUpload, verifyToken, checkRolePermission(['Chapter', 'is_add']), createChapter);
    app.get('/all-chapter', getAllChapter);
    app.get('/chapter-by-id/:chapterId', verifyToken, checkRolePermission(['Chapter', 'is_read']), getChapterByChapterId);
    app.get('/chapter-by-pcid/:postalcodeId', verifyToken, checkRolePermission(['Chapter', 'is_read']), getChapterBypcId);
    app.put('/update-chapter-image/:chapterId', cpUpload, verifyToken, checkRolePermission(['Chapter', 'is_edit']),  updateChapterImage);
    app.get('/user-chapter',verifyToken, checkRolePermission(['Chapter', 'is_read']), getUserChapter);
    app.put('/update/:chapterId',cpUpload, verifyToken, checkRolePermission(['Chapter', 'is_edit']), updateChapterById);
    app.delete('/delete/:chapterId',verifyToken, checkRolePermission(['Chapter', 'is_delete']), deleteChapterById);
    app.delete('/final-delete/:chapterId',verifyToken, checkRolePermission(['Chapter', 'is_delete']), finalDeleteChapterById);
    app.put('/restore/:chapterId',verifyToken, checkRolePermission(['Chapter', 'is_edit']),  restoreChapters);  
    app.put('/status-update/:chapterId',verifyToken, checkRolePermission(['Chapter', 'is_edit']), chapterStatusUpdate);
    app.get('/download-data',verifyToken, checkRolePermission(['Chapter', 'is_read']), downloadChapter);
    app.post('/verify-reffreal-code', verifyRefferalCode);

}

module.exports =  chapterRoute;
