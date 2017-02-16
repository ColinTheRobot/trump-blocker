// GET ALL IMAGES FROM DOM
var images = document.getElementsByTagName('IMG');

function eliminateTrump(images) {
  var filteredImages = []

  for (let i = 0; i < images.length; i++ ) {
    if (isTrumpish(images[i])) {
      filteredImages.push(images[i].src)
    }
  }

  filteredImages.filter(function(el) {
    if (el !== undefined) {
      return el
    }
  })
  console.log('FILTERED', filteredImages.length)
  return filteredImages
}

eliminateTrump(images).forEach(function(el){
  for (var i = 0; i < images.length; ++i) {
    if (images[i].src == el || images[i].getAttribute('data-baseurl') == el) {
      var clientRect = images[i].getBoundingClientRect()
      var width = Math.ceil(clientRect.width)
      var height = Math.ceil(clientRect.height)
      // data-baseurl for LATIMES
      if (images[i].getAttribute('data-baseurl')) {
        images[i].setAttribute('data-baseurl',`https://placekitten.com/${width}/${height}`);
      } else {
        images[i].setAttribute('src',`https://placekitten.com/${width}/${height}`);
      }
    }
  }
})

function isTrumpish(el) {
  if (el.src.match(/trump|pence|bannon|conway/gi) || el.alt.match(/trump|pence|bannon|conway/gi)) {
    return el
  }
}
