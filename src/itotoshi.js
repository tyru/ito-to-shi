import d3 from 'd3'
import 'd3-jetpack'
import * as global from './global.js'

(function($window, $document) {
  'use strict';

  function init() {
    const svgDS = global.getSvgDS();
    global.initSvgRoot(d3.select("body").select("svg"))
      .on('touchstart keydown mousedown', () => global.screenDispatcher.touchStart())
      .on('touchend keyup mouseup', () => global.screenDispatcher.touchEnd())
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);
    global.initContext(global.getInitVars(global.NORMAL_MODE));
    global.screenDispatcher.changeScreen(global.SCR_INITIAL);
  }

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

  $window.onload = init;
  $document.getElementById('fullscreen-btn').onclick = enableFullscreen;

})(window, document);
