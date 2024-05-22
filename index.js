const express = require('express');
const helmet = require('helmet');
const app = express();

const { config } = require('./config/index');

const authApi = require('./routes/auth');
const themeApi = require('./routes/themesAdministrator')
const categoryApi = require('./routes/categoryAdministrator');
const cors = require('cors');


const {
  logErrors,
  wrapErrors,
  errorHandler
} = require('./utils/middleware/errorHandlers.js');

const notFoundHandler = require('./utils/middleware/notFoundHandler');

app.use(cors());
// body parser
app.use(express.json());
app.use(helmet());


// routes
authApi(app);
themeApi(app);
categoryApi(app);


// Catch 404
app.use(notFoundHandler);

// Errors middleware
app.use(logErrors);
app.use(wrapErrors);
app.use(errorHandler);


app.listen(config.port, function() {
  // eslint-disable-next-line no-console
  console.log(`Listening http://localhost:${config.port}`);
});
