// require('./models/db');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');

var cors = require('cors');

const dashboardController = require('./controllers/DashboardController');
const ovoController = require('./controllers/OVOController');
const gopayController = require('./controllers/GoPayController');
const danaController = require('./controllers/DanaController');
const paramsController = require('./controllers/paramsController');
const rekapController = require('./controllers/rekapController')
const loginController = require('./controllers/loginController')
const linkAjaController = require('./controllers/LinkAjaController');
const CRUDController = require('./controllers/rekonsController');

function main () {
    var app = express();
    app.use(cors());
     app.use(bodyparser.urlencoded({
         extended: true
     }));
    app.use(bodyparser.json());
    app.use(bodyparser.text());
    app.use('/public', express.static(process.cwd() + '/public'))
    app.set('views', path.join(__dirname, '/views/'));
    app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
    app.set('view engine', 'hbs');
    
    
    app.listen(3005, () => {
        console.log('Express server started at port : 3005');
    });
    
    app.use('/rekons', CRUDController);
    app.use('/rekons/dashboard', dashboardController);
    app.use('/rekons/login', loginController);
    app.use('/rekons/ovo', ovoController);
    app.use('/rekons/gopay', gopayController);
    app.use('/rekons/linkaja', linkAjaController);
    app.use('/rekons/dana', danaController);
    app.use('/rekons/rekap', rekapController);
    app.use('/rekons/params', paramsController);

}

main();
