var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const path = require('path')
var oracledb = require('oracledb');
const moment = require('moment')
const {user, password, connectString, port} = require('./dbConfig')
var logger = require('./logger').createLogger(); // logs to STDOUT


// path to dir 
// import os module for directory
const os = require("os");
// check the available memory
const userHomeDir = os.homedir();

console.log(userHomeDir)
const userHomeDir1 = userHomeDir + '/Documents/Dev/projects/server/dist/my-app/';
console.log('userHomeDir1  ---->' ,userHomeDir1)

const distPath = path.join(__dirname, '/dist/my-app/')
console.log('dispatch ----->',distPath)
//-----------------------

var app = express();


//Logger
// let Logger = (req, res, next) => {
//   log{`${req.protocaL}://${req.get('host')} ${req.originalUrl}:
//   ${moment().format()}}) 
//   next()
//   `}
// }

// app.use(Logger);


app.use(cors());



//oracledb.autoCommit = true;


var connectionProperties = {
  user:  user,
  password:  password ,
  connectString : connectString 
  }

  
  function doRelease(connection) {
    connection.release(function (err) {
      if (err) {
        console.error(err.message);
      }
    });
  }

  // configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));

var PORT = port || 5000;


 /* 
 Note: Browsers and applications usually prevent calling REST services from 
 different sources. If you run the client on Server A and the REST services on 
 Server B, then you must provide a list of known clients in Server B by using the 
 Access-Control headers. Clients check these headers to allow invocation of a 
 service and prevent cross-site scripting attacks (XSS).

 *** Here Cors will handle REST API access
 */

 var router = express.Router();

//  console.log(process.cwd() + '/dist/my-app/index.html')
 // app.use(express.static('static'));
//  app.use(express.static(process.cwd() + '/dist/my-app/index.html'));

//  app.use(express.static(userHomeDir1));

app.use(express.static(distPath ));


/**
 * GET / 
 * Returns a list of employees 
 */
 router.route('/employees').get(function (request, response) {
    console.log("GET EMPLOYEES");

    oracledb.getConnection(connectionProperties, function (err, connection) {
      if (err) {
        console.error(err.message);
        response.status(500).send("Error connecting to DB");
        return;
      }
      console.log("After successful connection");
      connection.execute("SELECT * FROM employees",{},
        { outFormat: oracledb.OBJECT },
        function (err, result) {
          if (err) {
            console.error(err.message);
            response.status(500).send("Error getting data from DB");
            doRelease(connection);
            return;
          }
          // console.log("-------------------------------RESULTSET:" + JSON.stringify(result));
          
          // console.log(response.json(result.rows));
          // response.sendFile(distPath + 'index.html')
          // response.sendFile(userHomeDir1 + 'index.html')
           response.json(result.rows)
          
       
          doRelease(connection);
        });
    });
  });
// console.log(process.cwd() + '/dist/my-app/index.html')
// app.use(express.static('static'));
// app.use(express.static(process.cwd() + '/dist/my-app/index.html'));




app.use('/', router);
app.use('/employees', router)
// app.use('/employees', (req, res) => {
//   router;
//  res.sendFile(process.cwd() + '/dist/app-client/index.html');
// });


app.listen(PORT, () => {
  console.log('port ---->', PORT)
    console.log(`API is running on port ${PORT}.`)
})