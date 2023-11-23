const {createRange, getAllRanges, updateRangeById, deleteRangeById, getRangeById} = require('../../controller/TurnOverRange/rangeController')
const { checkUserPermission } = require('../../middleware/verifyRole')
const {verifyToken} = require('../../middleware/verifyToken')

const rangeRoute = (app) => {  
    app.post('/create-range',verifyToken, createRange)
    app.get('/get-all-range',  getAllRanges)
    app.put('/update/:rangeId',verifyToken, updateRangeById)
    app.delete('/delete/:rangeId',verifyToken, deleteRangeById)
    app.get('/range-by-id/:rangeId', getRangeById)
}

module.exports =  rangeRoute;
