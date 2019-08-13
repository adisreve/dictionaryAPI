const router = require('express').Router();
const cheerio = require('cheerio');
const request = require('request');
// const verify = require('../middleware/verifyToken')
const verify = require('../middleware/auth');

router.get('/', verify, (req, res) => {
    const url = "https://en.bab.la/dictionary/"
 
    const token = req.header('auth-token');
 
    
 
    request(url, function (error, response, html) {
       // First we'll check to make sure no errors occurred when making the request
       if (!error) {
          // Next, we'll utilize the cheerio library 
          const $ = cheerio.load(html);

          // let translation = $('.content .quick-results .quick-result-entry:first .quick-result-overview ul.sense-group-results li:first-child a').text();
 
          let data = $('.page .dict-select-wrapper .dict-select-column').find('li.bab-custom-dictsub .bab-dictsub-left-content a:nth-child(4)');
          let newData = {};
          newData.languages = [];
          Array.prototype.forEach.call(data, element => {
             // Pushing the data in the dictionary object
             newData.languages.push($(element).text());
 
          })
          // Send status 200 as passed and JSON Object as response
          res.status(200).send(newData);
       }
    });
 
 })

 module.exports = router;