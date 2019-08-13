const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const jwt = require('jsonwebtoken');
// const verify = require('./middleware/verifyToken');
const verify = require('./middleware/auth');
const router = express.Router();

const app = express();

const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Connect to database
mongoose.connect(
   process.env.DB_CONNECT,
   { useNewUrlParser: true },
   () => console.log('Connected to DB')
);

// Middleware
app.use(express.json());

// Headers
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
   next();
})

const authRoute = require('./middleware/dbauth');
const languagesRoute = require('./routes/languages');

app.use('/user', authRoute);

app.use('/languages', languagesRoute);

app.use('/:lang/:word', verify, (req, res) => {

   const url = `https://en.bab.la/dictionary/english-${req.params.lang}/${req.params.word}`;
   // const url = `https://en.bab.la/dictionary/english-spanish/chair`;

   function escapeHTML(string) {
      string.replace(/(\n)+/gim, "");
   }

   request(url, function (error, response, html) {
      // First we'll check to make sure no errors occurred when making the request
      if (!error) {
         // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
         const $ = cheerio.load(html);
         // let translation = $('.content .quick-results .quick-result-entry:first .quick-result-overview ul.sense-group-results li:first-child a').text();

         let data = $('.sense-group').first().find('.dict-entry');

         let newData = {};
         newData.dictionary = [];
         Array.prototype.forEach.call(data, element => {
            // Get the sound parameters from javascript function via regex
            let sound = $(element).children('.dict-translation').find('.dict-result .sound').attr('href');

            const regex = /\(([^)]+)\)/gim
            let soundParameters = regex.exec(sound);
            let soundArray = soundParameters[1].replace(/\'/g, "").split(',');

            // Get the language and sound id which is used to get the absolute url to that sound
            const soundLang = soundArray[0];
            const soundId = soundArray[1];

            const url = `https://en.bab.la/sound/${soundLang}/${soundId}.mp3`;

            // Pushing the data in the dictionary object
            newData.dictionary.push({
               source: $(element).children('.dict-translation').find('.dict-source strong').text(),
               translation: $(element).children('.dict-translation').find('.dict-result a:nth-child(2) strong').text(),
               example: $(element).children('.dict-example').find('.dict-result').children().remove().end().text(),
               pronounciation: url
            });

         })

         // Send status 200 as passed and JSON Object as response
         res.status(200).send(newData);
      }
   });
});

app.use((req, res, next) => {
   const error = new Error('Not Found');
   error.status = 404;
   next(error);
})

app.use((error, req, res, next) => {
   res.status(error.status || 500);
   res.json({
      error: {
         message: error.message
      }
   })
})

const port = process.env.PORT || 3500;

app.listen(port, () => {
   console.log(`We are live on port: ${port}`);
});

module.exports = app;