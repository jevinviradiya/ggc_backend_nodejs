const express = require('express');
const adminRoute = require('./Admin/adminRoute');
const userRoute = require('./User/userRoute');
const businessRoute = require('./Business/businessRoute');
const categoryRoute = require('./BusinessCategory/categoryRoute');
const businessDocRoute = require('./BusinessDoc/busienssDocRoute');
const membershipRoute = require('./Membership/membershipRoute');
const packageRoute = require('./MembershipPackage/packageRoute');
const eventRoute = require('./Event/eventRoute');
const countryRoute = require('./Country/countryRoute');
const cityRoute = require('./City/cityRoute');
const stateRoute = require('./State/stateRoute');
const pcRoute = require('./PostalCode/postalCodeRoute');
const chapterRoute = require('./Chapter/chapterRoute');
const roleRoute = require('./Role/roleRoute');
const partnerRequestRoute = require('./PartnerRequest/PartnerRequestRoute');
const rangeRoute = require('./TurnOverRange/rangeRoute');
const moduleRoute = require('./Module/moduleRoute');
const paymentRoute = require('./Payment/paymentRoute');
const blogRoute = require('./Blog/blogRoute');
const transactionRoute = require('./Transaction/transactionRoute');

const routes = (app, router) => {

  const adminRouter = express.Router();
  const userRouter = express.Router();
  const businessRouter = express.Router();
  const categoryRouter = express.Router();
  const businessDocRouter = express.Router();
  const membershipRouter = express.Router();
  const packageRouter = express.Router();
  const eventRouter = express.Router();
  const countryRouter = express.Router();
  const cityRouter = express.Router();
  const stateRouter = express.Router();
  const pcRouter = express.Router();
  const chapterRouter = express.Router();
  const roleRouter = express.Router();
  const partnerRequestRouter = express.Router();
  const rangeRouter = express.Router();
  const moduleRouter = express.Router();
  const paymentRouter = express.Router();
  const blogRouter = express.Router();
  const transactionRouter = express.Router();

  adminRoute(adminRouter);
  userRoute(userRouter);
  businessRoute(businessRouter);
  categoryRoute(categoryRouter);
  businessDocRoute(businessDocRouter);
  membershipRoute(membershipRouter);
  packageRoute(packageRouter);
  eventRoute(eventRouter);
  countryRoute(countryRouter);
  chapterRoute(chapterRouter);
  cityRoute(cityRouter);
  stateRoute(stateRouter);
  pcRoute(pcRouter);
  roleRoute(roleRouter);
  partnerRequestRoute(partnerRequestRouter);
  rangeRoute(rangeRouter);
  moduleRoute(moduleRouter);
  paymentRoute(paymentRouter);
  blogRoute(blogRouter);
  transactionRoute(transactionRouter);


  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/business', businessRouter);
  app.use('/api/v1/category', categoryRouter);
  app.use('/api/v1/business-doc', businessDocRouter);
  app.use('/api/v1/membership', membershipRouter);
  app.use('/api/v1/package', packageRouter);
  app.use('/api/v1/event', eventRouter);
  app.use('/api/v1/chapter', chapterRouter);
  app.use('/api/v1/partner-request', partnerRequestRouter);
  app.use('/api/v1/role', roleRouter);
  app.use('/api/v1/country', countryRouter);
  app.use('/api/v1/state', stateRouter);
  app.use('/api/v1/city', cityRouter);
  app.use('/api/v1/postalcode', pcRouter);
  app.use('/api/v1/range', rangeRouter);
  app.use('/api/v1/module', moduleRouter);
  app.use('/api/v1/payment', paymentRouter);
  app.use('/api/v1/blog', blogRouter);
  app.use('/api/v1/transaction', transactionRouter);

    app.use((req, res, next) => {
      const error = new Error('Not found.');
      error.status = 404;
      next(error);
    });
    
    app.use((error, req, res, next) => {
      return res.status(error.status || 500).send({message: error.message});
    });

}

module.exports = routes;
