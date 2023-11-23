const { verifyToken } = require('../../middleware/verifyToken');
const { createEvent, getAllEvents, getEventById, updateEventById, deleteEventById, getAllEventsOfChapter} = require('../../controller/Event/eventController');
const { cpUpload } = require('../../middleware/imageUpload');
const { checkRolePermission } = require('../../middleware/verifyRole');

const eventRoute = (app) => {

    app.post('/create-event', cpUpload, verifyToken, checkRolePermission(['Event', 'is_add']), createEvent)
    app.get('/all-event', verifyToken, checkRolePermission(['Event', 'is_read']), getAllEvents)
    app.get('/event-by-id/:eventId', verifyToken, checkRolePermission(['Event', 'is_read']), getEventById)
    app.get('/event-by-chapterId/:chapterId', verifyToken, checkRolePermission(['Event', 'is_read']), getAllEventsOfChapter)
    app.put('/update/:eventId', cpUpload, verifyToken, checkRolePermission(['Event', 'is_edit']), updateEventById)
    app.delete('/delete/:eventId', verifyToken, checkRolePermission(['Event', 'is_delete']), deleteEventById)

}

module.exports =  eventRoute;
