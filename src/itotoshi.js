import {runApp} from './app.js'

(function($window, $document) {
  'use strict';

  function enableFullscreen() {
    const elem = $document.getElementById("screen");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  $window.onload = runApp;
  $document.getElementById('fullscreen-btn').onclick = enableFullscreen;

})(window, document);
