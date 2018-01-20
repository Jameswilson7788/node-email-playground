// Include dependencies
var restify = require('restify');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

// Include config
var config = require('./config')

// Setup email config
var smtpTransport = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.username,
        pass: config.password
    }
});

// Create the server and map POST payload to request parameters object
var server = restify.createServer();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(
    function crossOrigin(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // the client could be a mobile app so we must allow POSTs from any origin
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        return next();
    }
);

/**
 * API endpoint for sending emails.
 *
 * @param {string} receipt The email address of the recepient
 * @param {string} subject The subject title of the email to send
 * @param {string} message The email message
 */
server.post('/email', function create(req, res, next) {
    if (!req.params.receipt === undefined ||
        req.params.subject === undefined ||
        req.params.message === undefined) {
        return next(); 
    }

    // Send an email to the visitor's welcomer with their details + signature
    smtpTransport.sendMail({
        from: config.sendAddr,
        to: req.params.receipt,
        subject: req.params.subject,
        html: req.params.message
    }, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
    });
    res.send(201, req.params);
});

// Start listening on port 8080
server.listen(8080, function () {
    console.log('%s listening at %s', server.name, 'http://my-api.app');
});