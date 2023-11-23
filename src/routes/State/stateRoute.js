const {  postState, getAllStates, updateState, inactiveState, deleteState, getStateByCountryId, getStateById, downloadStateData } = require('../../controller/State/stateController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');

const stateRoute = (app) => {
    app.post('/create-state',verifyToken, checkRolePermission(['State', 'is_add']), postState);
    app.get('/all-state', getAllStates)
    app.put('/update-state/:stateId',verifyToken,  checkRolePermission(['State', 'is_edit']), updateState)
    app.put('/inactivate-state/:stateId', inactiveState);
    app.delete('/delete-state/:stateId',verifyToken, checkRolePermission(['State', 'is_delete']), deleteState);
    app.get('/state-by-countryid/:countryId', getStateByCountryId);
    app.get('/state-by-id/:stateId', getStateById);
    app.get('/download-data',verifyToken, checkRolePermission(['State', 'is_read']), downloadStateData);

}

module.exports =  stateRoute;