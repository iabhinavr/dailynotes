import $ from 'jquery';
// import 'justifiedGallery/dist/css/justifiedGallery.css';
import 'justifiedGallery/dist/js/jquery.justifiedGallery.js';

(function(){
  $(document).ready(function() {
    $('.editorjs-image-gallery').justifiedGallery({
      rowHeight: 200,
      margins: 2,
      lastRow: 'nojustify'
    })
  })
})();