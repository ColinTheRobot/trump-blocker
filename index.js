pry = require('pryjs')
'use strict';
const express = require('express');
const cors = require('cors')
const app = express();
const request = require('request');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const testData = require('./test.js')
dotenv.load();



app.use(morgan('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'))

const serviceRoot = 'http://api.skybiometry.com/fc/';

app.post('/test', (req,res) => {
  // buildPictureString(req.body.pictures)
  var photosWithTags = testData.filter(function(val) {
    if (val.tags && !val.tags.length == 0 ) {
      return val
    }
  })
  res.json(photosWithTags)
})

// CURRENTLY ONLY WORKS WITH A SINGLE IMAGE AT A TIME
// res.json erroring dude to some Scope issue
app.post('/phototrain', (req, res) => {
    request.get(`${serviceRoot}faces/detect?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&urls=${req.body.pictures}`
    , function (error, res, body) {

        if (error) { return res.send(500, { message : error }); }

        var body = JSON.parse(body)
        var tags = "";
        for (var i in body.photos) {

            if (body["photos"][i].tags) {
                // we make the enforcement that the client only sends pictures of people with only 1 face in it.
                // we do this because we don't want to deal with the complexity of multiple faces in training pictures
                if (body["photos"][i].tags.length > 1) {
                    res.send(400, { message: 'You must send photos with clearly only 1 face in it. This photo has more than one face ' + body["photos"][i].url });
                    return;
                }
                if (body["photos"][i].tags.length === 1) {
                    tags += body["photos"][i].tags[0].tid + ',';
                }
                //0 tags just means no faces detected
            }
        }
        console.log('Got the  tag ids: ' + tags);

        //check if we didn't get any faces at all. If so, error out.
        if (tags.length == 0) {
            res.send(400, { message: 'None of the photos you sent had faces in it. ' + body["photos"][i].url });
        }

        //save the tags tagged as the name provided
        request.get(serviceRoot + "tags/save?api_key=" + process.env.API_KEY + "&api_secret=" + process.env.API_SECRET + "&uid=" + req.body.name + '@' + 'mainspace' + "&tids=" + tags,
        function (error, res, body) {

            //if we have an error return back a 500 error to the client
            if (error) { res.send(500, error); }

            //now execute the training for the set of images provided for the face
            request.get(`${serviceRoot}faces/train?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&uids=${req.body.name}@mainspace`,
            function (error, res, body) {

              res.json({ data: body });
            });
        });
        //return the list of images that were sucessfully used for training
    });
});

app.post('/photorec', function (req, res) {
  var pictureString = req.body.pictures.join(',', ',')
  console.log(pictureString)
  request.get(`${serviceRoot}faces/recognize?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&uids=all&urls=${pictureString}&namespace=mainspace&detector=aggresive&attributes=none&limit=3`,
    function (error, response, body) {
      var body = JSON.parse(body)

      // IF THE API IS MAXED OUT FILTER OUT URLS WITHOUT TRUMPS NAME
      if (body.status == 'failure') { return res.json({status: 500, photos: eliminateTrump(pictureString)}); }

      var photosWithTags = body.photos.filter(function(val) {
        if (val.tags && !val.tags.length == 0 ) {
          return val
        }
      })

      // FILTER BY CONFIDENCE (COMMENTED OUT DUE TO LACK OF TRAINING)
      // var filteredPhotos = photosWithTags.filter(function(val) {
      //   if (val.tags[0].uids[0].confidence > 40) {
      //     return val
      //   }
      // })

    res.json({ photos: photosWithTags});
  });
});

var buildPictureString = function(images) {
  return JSON.parse(images).join(',', ',')
}

var eliminateTrump = function(images) {
  var splitImages = images.split(',');
  var filteredImages = splitImages.map(function(el){
    if (el.match(/trump/gi)) {
      return el
    }
  }).filter(function(el) {
    if (el !== undefined) {
      return el
    }
  })
  return filteredImages
}

app.listen(process.env.PORT || 3001);
