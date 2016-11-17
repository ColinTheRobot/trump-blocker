pry = require('pryjs')
'use strict';
const express = require('express');
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
app.get('/test', (req,res) => {
  // buildPictureString(req.body.pictures)
  res.send('hiii hi hi')
})


app.post('/test', (req,res) => {
  // buildPictureString(req.body.pictures)
  var photosWithTags = testData.filter(function(val) {
    if (val.tags && !val.tags.length == 0 ) {
      return val
    }
  })
  res.json(photosWithTags)
})

app.post('/phototrain', (req, res) => {
    request.get(`${serviceRoot}faces/detect?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&urls=${req.body.pictures}`
    , function (error, res, body) {

        if (error) { return res.send(500, { message : error }); }

        var body = JSON.parse(body)
        var tags = "";
        // eval(pry.it)
        for (var i in body.photos) {

            if (body["photos"][i].tags) {
                //we make the enforcement that the client only sends pictures of people with only 1 face in it.
                //we do this because we don't want to deal with the complexity of multiple faces in training pictures
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
        // eval(pry.it)

        //check if we didn't get any faces at all. If so, error out.
        // if (tags.length == 0) {
        //     res.send(400, { message: 'None of the photos you sent had faces in it. ' + body["photos"][i].url });
        //     // return;
        // }

        //save the tags tagged as the name provided
        request.get(serviceRoot + "tags/save?api_key=" + process.env.API_KEY + "&api_secret=" + process.env.API_SECRET + "&uid=" + req.body.name + '@' + 'mainspace' + "&tids=" + tags,
        function (error, res, body) {

            //if we have an error return back a 500 error to the client
            if (error) { res.send(500, error); }

            //now execute the training for the set of images provided for the face
            request.get(`${serviceRoot}faces/train?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&uids=${req.body.name}@mainspace`,
            function (error, res, body) {

                if (error) { return res.send(500, error); }

                for (var i in body["photos"]) {
                    //api will resize images to max width/height of 1024. However it won't reflect that in width/height
                    //field of each photo returned. So change it here
                    var photo = body["photos"][i];

                    //remember, we assume 1 tagged face in each photo
                    var tag = photo.tags[0];

                    //coordinates of interesting points are returned in percentages and
                    //need to be re-calculated as absolute positions before rendering
                    tag.eye_left.x = (tag.eye_left.x / 100) * photo.width;
                    tag.eye_left.y = (tag.eye_left.y / 100) * photo.height;
                    tag.eye_right.y = (tag.eye_right.y / 100) * photo.height;
                    tag.eye_right.x = (tag.eye_right.x / 100) * photo.width;
                    tag.mouth_center.x = (tag.mouth_center.x / 100) * photo.width;
                    tag.mouth_center.y = (tag.mouth_center.y / 100) & photo.height;
                    tag.nose.x = (tag.nose.x / 100) * photo.width;
                    tag.nose.y = (tag.nose.y / 100) * photo.height;

                }
                console.log(body)
            });
            //return the list of images that were sucessfully used for training
        });
        // res.json({ data: body });
    });
});

app.post('/photorec', function (req, res) {
    var pictureString = req.body.pictures.join(',', ',')
    console.log(pictureString)
    request.get(`${serviceRoot}faces/recognize?api_key=${process.env.API_KEY}&api_secret=${process.env.API_SECRET}&uids=all&urls=${pictureString}&namespace=mainspace&detector=aggresive&attributes=none&limit=3`,
    function (error, response, body) {
        var body = JSON.parse(body)
        // eval(pry.it)
        if (body.status == 'failure') { return res.json({status: 500, photos: eliminateTrump(pictureString)}); }

        //because the API can return a success error code but not recognize any face we need to
        //check if we got a picture with a face detected.
        // else if (!body["photos"][0].tags || !body.photos[0].tags[0]) {
        //     res.send(400, { message: 'sorry, no photos detected in this image' });
        // }

        console.log(body)
        var photosWithTags = body.photos.filter(function(val) {
          if (val.tags && !val.tags.length == 0 ) {
            return val
          }
        })
        // eval(pry.it)

        // FILTER BY CONFIDENCE
        // var filteredPhotos = photosWithTags.filter(function(val) {
        //   if (val.tags[0].uids[0].confidence > 40) {
        //     return val
        //   }
        // })

        res.json({ photos: photosWithTags});

      // res.send(400, { message: 'The API has no guesses as to who is in the photo' });

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

app.listen(3001);
