window.ItoToShi = (function() {
  var svgDS = {
    'width': 200,
    'height': 200
  };
  var needleGroupDS = [
    {x: 0, y: 0},
    {x: 50, y: 10}
  ];
  var needleDS = [
    {x: 0, y: 0, fill: 'gray', width: 10, height: 70, animate: true},
    {x: 2, y: 1, fill: 'white', width: 6, height: 20, animate: true}
  ];
  var needleDx = 5;
  var needleGapX = 10;
  var needleResetX = -10;
  var theTimer = null;
  var INTERVAL = 1000.0 / 30.0;
  var $svg;

  var enableFullscreen = function enableFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  };

  var onLoad = function onLoad() {
    $svg = d3.select("body").select("svg")
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);
    drawNeedles(needles());
  };

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in display...)
  var needles = function needles() {
    return $svg.selectAll('g').data(needleGroupDS);
  };

  var moveNeedles = function moveNeedles() {
    needleGroupDS = needleGroupDS.map(function(d) {
      if (d.x + needleDx >= svgDS.width + needleGapX) {
        d.x = needleResetX;
        d.animate = false;
      } else {
        d.x += needleDx;
        d.animate = true;
      }
      return d;
    });
  };

  var drawNeedles = function drawNeedles($needles) {
    // Make needles
    $needles.enter().append('g')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .selectAll('rect').data(needleDS).enter().append('rect')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
      .attr('fill', function(d) { return d.fill; })
      .attr('width', function(d) { return d.width; })
      .attr('height', function(d) { return d.height; })
    // Animation
    $needles.each(function(d) {
      d3.select(this)
      .transition().duration(d.animate ? INTERVAL : 0)
        .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
    });
  };

  var toggle = function toggle() {
    if (theTimer) {
      clearInterval(theTimer);
      theTimer = null;
    } else {
      theTimer = setInterval(update, INTERVAL);
    }
  };

  var update = function update() {
    console.log('update() enter');
    // Move
    moveNeedles();
    // Update display
    drawNeedles(needles());
  };

  return {
    enableFullscreen: enableFullscreen,
    toggle: toggle,
    onLoad: onLoad
  };
})();
