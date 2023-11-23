const {createMembership, getMemberships, updateMembershipById, deleteMembershipById, getMembershipById, downloadMembershipData, purchaseMembership} = require('../../controller/Membership/membershipController')
const { checkRolePermission } = require('../../middleware/verifyRole');
const {verifyToken} = require('../../middleware/verifyToken')

const membershipRoute = (app) => {  
    app.post('/create-membership',verifyToken, checkRolePermission(['Membership', 'is_add']), createMembership)
    app.get('/get-all-memberships', verifyToken, checkRolePermission(['Membership', 'is_read']), getMemberships)
    app.put('/update/:membershipId',verifyToken, checkRolePermission(['Membership', 'is_edit']), updateMembershipById)
    app.delete('/delete/:membershipId',verifyToken, checkRolePermission(['Membership', 'is_delete']), deleteMembershipById)
    app.get('/membership-by-id/:membershipId',verifyToken, checkRolePermission(['Membership', 'is_read']), getMembershipById)
    app.get('/download-data',verifyToken, checkRolePermission(['Membership', 'is_read']), downloadMembershipData);
    app.post('/purchase-membership', verifyToken, purchaseMembership)
}

module.exports =  membershipRoute;
