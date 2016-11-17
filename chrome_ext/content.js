// AND SEARCH FOR BACKGROUND IMAGES IN CSS
  var images = document.getElementsByTagName('IMG');
  var imageUrls= [];

  for (let i = 0; i < images.length; i++) {
    if (images[i].src) {
      imageUrls.push(images[i].src)
    } else {
      imageUrls.push(images[i].getAttribute('data-baseurl'))
    }
  }


// TODO:  CODE TO CHECK FOR BACKGROUND IMAGES

// for (var i in sheets) {
//   var rules = sheets[i].rules || sheets[i].cssRules
//   for (var r in rules) {
//     var json = css2json(rules[r].style)
//     if (json['background-image'] == "url('http://www.newyorker.com/wp-content/uploads/2016/11/Cassidy-DonaldTrumpsGreatBaitAndSwitch-728x375-1479138921.jpg')") {
//        console.log(json)
//     }
//   }
// }
//   function css2json(css) {
//     var s = {};
//     if (!css) return s;
//
//     if (css instanceof CSSStyleDeclaration) {
//         for (var i in css) {
//             if ((css[i]).toLowerCase) {
//                 s[(css[i]).toLowerCase()] = (css[css[i]]);
//             }
//         }
//     } else if (typeof css == "string") {
//         css = css.split("; ");
//         for (var i in css) {
//             var l = css[i].split(": ");
//             s[l[0].toLowerCase()] = (l[1]);
//         }
//     }
//     return s;
// }

// TEST REQUEST

// var xhr = new XMLHttpRequest();
// xhr.onload = function (e) {
//   let data = JSON.parse(e.target.response)
//   data.forEach(function(el){
//     console.log('hey')
//     var images = document.getElementsByTagName('IMG');
//     for (var i = 0; i < images.length; ++i) {
//       if (images[i].src == el.url) {
//         console.log('TRUEEEE', el.url, images[i])
//         images[i].setAttribute('src','http://placekitten.com/50/50');
//       }
//     }
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
    if (data.status == 500) {
      data.photos.forEach(function(el){
        var images = document.getElementsByTagName('IMG');
        for (var i = 0; i < images.length; ++i) {
          if (images[i].src == el || images[i].getAttribute('data-baseurl') == el) {
            images[i].setAttribute('src','http://placekitten.com/50/50');
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
  
  xhr.open('POST', 'http://localhost:3001/photorec', true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({pictures: imageUrls}));
