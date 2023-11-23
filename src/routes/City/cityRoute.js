const { postCity, getAllCities, updateCity, inactiveCity, deleteCity, getCityByStateId, getCityById, downloadCityData} = require('../../controller/City/cityController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');

const cityRoute = (app) => {
    app.post('/create-city',verifyToken, checkRolePermission(['City', 'is_add']), postCity)
    app.get('/all-city', getAllCities)
    app.put('/update-city/:cityId',verifyToken, checkRolePermission(['City', 'is_edit']), updateCity)
    app.put('/inactivate-city/:cityId', inactiveCity);
    app.delete('/delete-city/:cityId',verifyToken, checkRolePermission(['City', 'is_delete']), deleteCity);
    app.get('/city-by-stateid/:stateId', getCityByStateId);
    app.get('/city-by-id/:cityId', getCityById);
    app.get('/download-data',verifyToken, checkRolePermission(['City', 'is_read']), downloadCityData);
}
module.exports =  cityRoute;