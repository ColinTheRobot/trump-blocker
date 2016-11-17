var images = document.getElementsByTagName('IMG');
var imageUrls= [];

// GET ALL IMAGES FROM DOM
for (let i = 0; i < images.length; i++) {
  if (images[i].src) {
    imageUrls.push(images[i].src)
  } else {
    // TO ACCOUNT FOR OTHER IMAGE ATTR (data-baseurl) at latimes
    imageUrls.push(images[i].getAttribute('data-baseurl'))
  }
}

// TEST REQUEST TO NOT WRECK THE API THROTTLING

// var xhr = new XMLHttpRequest();
// xhr.onload = function (e) {
//   let data = JSON.parse(e.target.response)
//   data.forEach(function(el){
//    console.log('hey')
  // var images = document.getElementsByTagName('IMG');
  // for (var i = 0; i < images.length; ++i) {
  //   if (images[i].src == el.url || images[i].getAttribute('data-baseurl') == el.url) {
  //     console.log('TRUEEEE', el.url, images[i])
  //     images[i].setAttribute('src','http://placekitten.com/50/50');
  //   }
  // }
//   })
//
// };
// xhr.open('POST', 'http://localhost:3001/test', true);
// xhr.setRequestHeader("Content-type", "application/json");
//
// xhr.send(JSON.stringify({pictures: {photos: ['url1', 'url2']}}));

  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    let data = JSON.parse(e.target.response)

    // IF THE skybiometry API IS MAXED OUT REPLACE IMAGES THAT CONTAIN TRUMPS NAME
    if (data.status == 500) {
      data.photos.forEach(function(el){
        var images = document.getElementsByTagName('IMG');
        for (var i = 0; i < images.length; ++i) {
          if (images[i].src == el || images[i].getAttribute('data-baseurl') == el) {
            var width = images[i].getAttribute('width') || images[i].getAttribute('data-width') || 75;
            var height = images[i].getAttribute('height') || images[i].getAttribute('data-height') || 75;
            images[i].setAttribute('src',`http://placekitten.com/${width}/${height}`);
          }
        }
      })
    } else {
      data.photos.forEach(function(el){
        console.log('hey')
        var images = document.getElementsByTagName('IMG');
        for (var i = 0; i < images.length; ++i) {
          if (images[i].src == el.url || images[i].getAttribute('data-baseurl') == el.url) {
            console.log('TRUEEEE', el.url, images[i])
            images[i].setAttribute('src','http://placekitten.com/50/50');
          }
        }
      })
    }
  };

  var url = 'https://aqueous-sands-87859.herokuapp.com/;'

  xhr.open('POST', 'https://aqueous-sands-87859.herokuapp.com/', true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({pictures: imageUrls}));
