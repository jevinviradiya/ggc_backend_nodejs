const { postCountry, updateCountry, inactiveCountry, getAllCountries, deleteCountry, getCountryById, downloadCountryData} = require('../../controller/Country/countryController')
const {verifyToken} = require('../../middleware/verifyToken')
const { checkRolePermission } = require('../../middleware/verifyRole');


const countryRoute = (app) => {

    app.post('/create-country',verifyToken, checkRolePermission(['Country', 'is_add']), postCountry);
    app.get('/all-country', getAllCountries)
    app.put('/update-country/:countryId',verifyToken, checkRolePermission(['Country', 'is_edit']), updateCountry)
    app.put('/inactivate-country/:countryId', inactiveCountry);
    app.delete('/delete-country/:countryId',verifyToken, checkRolePermission(['Country', 'is_delete']), deleteCountry);
    app.get('/country-by-id/:countryId', getCountryById);
    app.get('/download-data',verifyToken, checkRolePermission(['Country', 'is_read']), downloadCountryData);


}

module.exports =  countryRoute;