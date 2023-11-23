const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const logger = require('morgan')
const routes = require('./src/routes/index');
const router = express.Router();
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// http://localhost:5000/api-docs/#/

const corsOpts = {
  origin: '*',
  methods: [
    'GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE',
  ],
};

app.use(cors(corsOpts));
app.use(logger("dev"));
app.use(bodyParser.json({limit: '500mb'}));
app.get('/', (req, res) => {
  res.send('Running');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

//routes
// app.use('/api/admin', adminRouter);

app.use('/public/images', express.static('public/images'));
app.use('/public/files', express.static('public/files'));

routes(app, router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
