window.ItoToShi = (function() {

  // TODO: Support the all following screen widths like the ones defined by Bootstrap
  // * Extra small devices (phones, less than 768px)
  //   * No media query since this is the default in Bootstrap
  // * Small devices (tablets, 768px and up)
  //   * @media (min-width: @screen-sm-min) { ... }
  // * Medium devices (desktops, 992px and up)
  //   * @media (min-width: @screen-md-min) { ... }
  // * Large devices (large desktops, 1200px and up)
  //   * @media (min-width: @screen-lg-min) { ... }

  function getInitVars() {
    return {
      svgDS: {
        width: 200,
        height: 200
      },
      needleGroupDS: [ // <g>
        {x: 0, y: 0},
        {x: 50, y: 10}
      ],
      needleDS: [  // <rect>
        {x: 0, y: 0, fill: 'gray', width: 10, height: 70, animate: true},
        {x: 2, y: 1, fill: 'white', width: 6, height: 20, animate: true}
      ],
      threadDS: [{  // <circle>
        fill: 'red', cx: 10, cy: 10, r: 5, a: /*9.8*/ 1
      }],
      gameOverDS: [{
        x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
      }],
      needleDx: 5,
      needleGapX: 10,
      needleResetX: -10,
      Da: 1,
      minA: -10,
      maxA: 10,
      hovering: false,
      threadGameOverGapY: 10,
      isGameOver: false,
      isInitial: true,
      theTimer: null
    };
  }

  var INTERVAL = 1000.0 / 30.0;
  var ST_INITIAL = 1;
  var ST_RUNNING = 2;
  var ST_STOPPED = 4;
  var ST_GAMEOVER = 8;
  var $svg;
  var ctx;

  // 1. Initial -> (unset isInitial) -> Running
  // 2. Running -> Stopped
  // 3. Stopped -> Running
  // 4. GameOver -> Initial -> (unset isInitial) -> Running
  var startStopContinue = function startStopContinue() {
    var state = getState();
    if (state & (ST_INITIAL | ST_STOPPED)) {
      ctx.isInitial = false;
      ctx.theTimer = setInterval(update, INTERVAL);
    } else if (state & ST_RUNNING) {
      clearInterval(ctx.theTimer);
      ctx.theTimer = null;
    } else if (state & ST_GAMEOVER) {
      init();
      ctx.isInitial = false;
      ctx.theTimer = setInterval(update, INTERVAL);
    }
  };

  var getState = function getState() {
    if (ctx.isGameOver) {
      return ST_GAMEOVER;
    } else if (ctx.isInitial) {
      return ST_INITIAL;
    } else if (!ctx.theTimer) {
      return ST_STOPPED;
    } else {
      return ST_RUNNING;
    }
  };

  var setGameOver = function setGameOver() {
    clearInterval(ctx.theTimer);
    ctx.theTimer = null;
    ctx.isGameOver = true;
  };

  // 1. Initial -> (unset isInitial) -> Running
  // 2. Running -> (set hovering) -> Running
  // 3. Stopped -> Running
  // 4. GameOver -> Initial -> (unset isInitial) -> Running
  var setHovering = function() {
    var state = getState();
    if (state & (ST_INITIAL | ST_STOPPED)) {
      ctx.isInitial = false;
      ctx.theTimer = setInterval(update, INTERVAL);
    } else if (state & ST_RUNNING) {
      ctx.hovering = true;
    } else if (state & ST_GAMEOVER) {
      init();
      ctx.isInitial = false;
      ctx.theTimer = setInterval(update, INTERVAL);
    }
  };

  var unsetHovering = function() {
    ctx.hovering = false;
  };

  var init = function init() {
    // Draw variables
    ctx = getInitVars();
    // Draw initial screen
    $svg = d3.select("body").select("svg")
      .on('touchstart', setHovering)
      .on('touchend', unsetHovering)
      .on('keydown', setHovering)
      .on('keyup', unsetHovering)
      .on('mousedown', setHovering)
      .on('mouseup', unsetHovering)
      .attr('width', ctx.svgDS.width)
      .attr('height', ctx.svgDS.height);
    drawThread(getThread());
    drawNeedles(getNeedles());
    drawGameOver(getGameOver());
  };

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

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in screen...)
  var getNeedles = function getNeedles() {
    return $svg.selectAll('g').data(ctx.needleGroupDS);
  };

  var moveNeedles = function moveNeedles() {
    ctx.needleGroupDS = ctx.needleGroupDS.map(function(d) {
      if (d.x + ctx.needleDx >= ctx.svgDS.width + ctx.needleGapX) {
        d.x = ctx.needleResetX;
        d.animate = false;
      } else {
        d.x += ctx.needleDx;
        d.animate = true;
      }
      return d;
    });
  };

  var drawNeedles = function drawNeedles($needles) {
    // Make needles
    $needles.enter().append('g')
      .selectAll('rect').data(ctx.needleDS).enter().append('rect')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
      .attr('fill', function(d) { return d.fill; })
      .attr('width', function(d) { return d.width; })
      .attr('height', function(d) { return d.height; });
    // Movements
    $needles.each(function(d) {
      // http://stackoverflow.com/questions/26903355/how-to-cancel-scheduled-transition-in-d3
      d3.select(this)
      .transition().duration(d.animate ? INTERVAL : 0)
        .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
    });
  };

  var getThread = function getThread() {
    return $svg.selectAll('circle').data(ctx.threadDS);
  };

  var moveThread = function moveThread() {
    var dataset = ctx.threadDS[0];
    if (!ctx.hovering) {
      if (dataset.a < ctx.maxA) {
        dataset.a += ctx.Da;
      }
    } else {
      if (dataset.a > ctx.minA) {
        dataset.a -= ctx.Da;
      }
    }
    dataset.cy += dataset.a;
    console.log('a=' + dataset.a + ', cy=' + dataset.cy);
    return dataset.cy < ctx.svgDS.height + ctx.threadGameOverGapY;
  };

  var drawThread = function drawThread($thread) {
    $thread.enter().append('circle')
      .attr('cx', function(d) { return d.cx; })
      .attr('cy', function(d) { return d.cy; })
      .attr('r', function(d) { return d.r; })
      .attr('fill', function(d) { return d.fill; });
    // Movements
    $thread.transition().duration(INTERVAL)
      .attr('transform', function(d) { return 'translate(' + d.cx + ',' + d.cy + ')'; });
  };

  var getGameOver = function getGameOver() {
    return $svg.selectAll('text').data(ctx.gameOverDS);
  };

  var moveGameOver = function moveGameOver() {
    var dataset = ctx.gameOverDS[0];
    var bbox = document.getElementById('gameover').getBBox();
    dataset.x = ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = ctx.svgDS.height / 2 - bbox.height / 2;
  };

  var drawGameOver = function drawGameOver($gameover) {
    $gameover.enter().append('text')
      .attr('id', 'gameover')
      .attr('font-size', function(d) { return d.fontSize; })
      .text(function(d) { return d.text; });
    // Movements
    $gameover.transition().duration(0)
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
  };

  var update = function update() {
    console.log('update() enter');
    // Move objects
    var doContinue = moveThread();
    moveNeedles();
    // Update screen
    drawThread(getThread());
    drawNeedles(getNeedles());

    if (!doContinue) {
      moveGameOver();
      drawGameOver(getGameOver());
      setGameOver();
    }
  };

  return {
    enableFullscreen: enableFullscreen,
    startStopContinue: startStopContinue,
    init: init
  };
})();
