window.ItoToShi = (function() {
  'use strict';

  // TODO: Support the all following screen widths like the ones defined by Bootstrap
  // * Extra small devices (phones, less than 768px)
  //   * No media query since this is the default in Bootstrap
  // * Small devices (tablets, 768px and up)
  //   * @media (min-width: @screen-sm-min) { ... }
  // * Medium devices (desktops, 992px and up)
  //   * @media (min-width: @screen-md-min) { ... }
  // * Large devices (large desktops, 1200px and up)
  //   * @media (min-width: @screen-lg-min) { ... }
  // TODO: Generate needles from random data
  // TODO: Auto full screen on load (#fullscreen)
  // TODO: More effects (explosion on GAME OVER, Level up, ...)
  // TODO: Better (background|needle)' images
  // TODO: Use requestAnimationFrame() instead of setInterval() ?

  var INTERVAL = 1000.0 / 30.0;
  var ST_INITIAL = 1;
  var ST_RUNNING = 2;
  var ST_STOPPED = 4;
  var ST_GAMEOVER = 8;
  var NEEDLE_WHOLE_DY = 1;
  var $svg;
  var ctx;

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
    drawStatusText(getStatusText());
    drawGameOver(getGameOver());
  };

  // Update screen. this function is called every frame.
  //   before *1    result
  //   false  false false
  //   false  true  false
  //   true   false false
  //   true   true  true
  // *1 moveThread(), detectCollision()
  var update = function update() {
    console.log('update() enter');
    // Move objects
    var doContinue = moveThread();
    moveNeedles();
    doContinue = detectCollision() && doContinue;
    // Update screen
    drawThread(getThread());
    drawNeedles(getNeedles());
    drawStatusText(getStatusText());
    // GAME OVER
    if (!doContinue) {
      moveGameOver();
      drawGameOver(getGameOver());
      setGameOver();
    }
  };

  var randNumBetween = function randNumBetween(start, end) {
    return Math.random() * (end - start) + start;
  };

  var assert = function assert(cond, msg) {
    if (!cond) {
      throw new Error('Assertion Error' + (msg ? ': ' + msg : ''));
    }
  };

  var getInitVars = function getInitVars() {
    var svgDS = {
      width: 320,
      height: 320
    };
    var scoreMmMap = [
      // [least score, hole height (mm), distanceX]
      [0, 100, 200],
      [10, 90, 180],
      [20, 80, 160],
      [30, 70, 140],
      [40, 60, 140],
      [50, 50, 140]
    ];
    // Generate needle objects.
    var needleGroupDS = [];
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    var needleNum = Math.floor(svgDS.width / scoreMmMap[0][2] + 2);
    // First object is placed at x=200
    var objX = 200;
    for (var i = 0; i < needleNum; i++) {
      needleGroupDS.push({
        x: objX,
        y: randNumBetween(0, svgDS.height - scoreMmMap[0][1]),
        passed: false
      });
      objX += scoreMmMap[0][2];
    }

    return {
      svgDS: svgDS,
      needleGroupDS: needleGroupDS, // <g>
      needleDS: [  // <rect>
        {x: 0, y: 0, fill: 'gray', width: 10, height: 999, animate: true},
        {x: 2, y: NEEDLE_WHOLE_DY, fill: 'white', width: 6,
          height: scoreMmMap[0][1], animate: true}
      ],
      threadDS: [{  // <circle>
        fill: 'red', cx: 10, cy: 0, r: 5, a: /*9.8*/ 1
      }],
      statusTextDS: [{  // <text>
        x: 100, y: 12, fontSize: '12px', text: '',
        score: 0
      }],
      scoreMmMap: scoreMmMap,
      level: 0,
      gameOverDS: [{  // <text>
        x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
      }],
      needleDx: -5,
      needleGapX: -10,
      Da: 1,
      minA: -10,
      maxA: 10,
      hovering: false,
      threadGameOverGapY: 10,
      isGameOver: false,
      isInitial: true,
      theTimer: null
    };
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
    d3.event.preventDefault();    // Don't propagate click event to outside <svg> tag
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

  // ======================= Needles =======================

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in screen...)
  var getNeedles = function getNeedles() {
    return $svg.selectAll('.needle').data(ctx.needleGroupDS);
  };

  var moveNeedles = function moveNeedles() {
    var willMove = -1;
    var maxRightX = -1;
    ctx.needleGroupDS = ctx.needleGroupDS.map(function(d, i) {
      if (d.x + ctx.needleDx < ctx.needleGapX) {
        assert(willMove === -1, '0 <= moving needles <= 1');
        willMove = i;
      } else {
        d.x += ctx.needleDx;
        d.animate = true;
      }
      maxRightX = Math.max(maxRightX, d.x);
      return d;
    });
    if (willMove >= 0) {
      // Determine if I must calculate the distanceX by next level or current level.
      var level = getCurrentScore() + ctx.needleGroupDS.length >= getScoreByLevel(ctx.level + 1) ?
                    ctx.level + 1 : ctx.level;
      var distanceX = getDistanceXByLevel(level);
      var mm = getMmByLevel(level);
      // Move the needle to the right.
      var d = ctx.needleGroupDS[willMove];
      d.x = maxRightX + distanceX;
      d.y = randNumBetween(0, ctx.svgDS.height - mm);
      d.animate = false;
      d.passed = false;
      // Add a new needle if necessary.
      var nextNeedleNum = Math.floor(ctx.svgDS.width / getDistanceXByLevel(ctx.level + 1) + 2);
      assert(nextNeedleNum >= ctx.needleGroupDS.length,
             'Lv.UP must not cause getMmByLevel() to be smaller number');
      if (level > ctx.level && nextNeedleNum > ctx.needleGroupDS.length) {
        // Re-calculate the necessary number of needles.
        nextNeedleNum = nextNeedleNum - ctx.needleGroupDS.length;
        var objX = d.x + distanceX;
        for (var i = 0; i < nextNeedleNum; i++) {
          ctx.needleGroupDS.push({
            x: objX,
            y: randNumBetween(0, ctx.svgDS.height - mm),
            passed: false
          });
          objX += distanceX;
        }
      }
    }
  };

  var drawNeedles = function drawNeedles($needles) {
    // Enter
    $needles.enter().append('g')
      .attr('class', 'needle');

    var $needleChildren = $needles.selectAll('rect').data(ctx.needleDS);
    $needleChildren
      .enter().append('rect')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
      .attr('fill', function(d) { return d.fill; })
      .attr('width', function(d) { return d.width; });

    // Update
    $needles.each(function(d) {
      // http://stackoverflow.com/questions/26903355/how-to-cancel-scheduled-transition-in-d3
        d3.select(this)
          .transition().duration(d.animate ? INTERVAL : 0)
          .attr('transform', 'translate(' + d.x + ',' + d.y + ')');
    });

    $needleChildren
      .transition().duration(INTERVAL * 3)
      .attr('height', function (d) { return d.height; });

    // Exit
    $needles.exit().remove();
  };

  // ======================= Thread =======================

  var getThread = function getThread() {
    return $svg.selectAll('.thread').data(ctx.threadDS);
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
    return dataset.cy < ctx.svgDS.height + ctx.threadGameOverGapY;
  };

  var drawThread = function drawThread($thread) {
    // Enter
    $thread.enter().append('circle')
      .attr('class', 'thread')
      .attr('cx', function(d) { return d.cx; })
      .attr('cy', function(d) { return d.cy; })
      .attr('r', function(d) { return d.r; })
      .attr('fill', function(d) { return d.fill; });
    // Update
    $thread.transition().duration(INTERVAL)
      .attr('transform', function(d) { return 'translate(' + d.cx + ',' + d.cy + ')'; });
  };

  // ======================= "GAME OVER" text =======================

  var getGameOver = function getGameOver() {
    return $svg.selectAll('#gameOver').data(ctx.gameOverDS);
  };

  var moveGameOver = function moveGameOver() {
    var dataset = ctx.gameOverDS[0];
    var bbox = document.getElementById('gameOver').getBBox();
    dataset.x = ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = ctx.svgDS.height / 2 - bbox.height / 2;
  };

  var drawGameOver = function drawGameOver($gameover) {
    // Enter
    $gameover.enter().append('text')
      .attr('id', 'gameOver')
      .attr('class', 'disable-select')
      .attr('font-size', function(d) { return d.fontSize; })
      .text(function(d) { return d.text; });
    // Update
    $gameover
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
  };

  // ======================= Status text =======================

  var getStatusText = function getStatusText() {
    return $svg.selectAll('#statusText').data(ctx.statusTextDS);
  };

  // score -> level -> mm
  var calcLevelByScore = function calcLevelByScore(score) {
    if (ctx.level + 1 < ctx.scoreMmMap.length) {
      if (score >= getScoreByLevel(ctx.level + 1)) {
        return ctx.level + 1;
      }
      return ctx.level;
    } else {
      return Math.min(ctx.level, ctx.scoreMmMap.length - 1);
    }
  };

  // @returns Current score
  var getCurrentScore = function getCurrentScore() {
    return ctx.statusTextDS[0].score;
  };

  // @returns Least score
  // @seealso ctx.scoreMmMap
  var getScoreByLevel = function getScoreByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][0];
  };

  // @returns Hole height (mm)
  //          NOTE: Actually returns 'px' number, not 'mm' ... ;)
  // @seealso ctx.scoreMmMap
  var getMmByLevel = function getMmByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][1];
  };

  // @returns distanceX
  // @seealso ctx.scoreMmMap
  var getDistanceXByLevel = function getDistanceXByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][2];
  };

  var drawStatusText = function drawStatusText($statusText) {
    // Enter
    $statusText.enter().append('text')
      .attr('id', 'statusText')
      .attr('class', 'disable-select')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
      .attr('font-size', function(d) { return d.fontSize; });
    // Update
    var mm = getMmByLevel(ctx.level);
    var distanceX = getDistanceXByLevel(ctx.level);
    $statusText
      .text(function(d) { return d.score + '本 針穴' + mm + 'mm 距離' + distanceX + 'm'; });
  };

  // ======================= Collision detection =======================

  // Detect collisions with thread & needles.
  var detectCollision = function detectCollision() {
    var doContinue = true;
    var thread = ctx.threadDS[0];
    var statusText = ctx.statusTextDS[0];
    getNeedles().each(function(d) {
      if (d.passed) return;
      var mm = getMmByLevel(ctx.level);
      var fromY = d.y + NEEDLE_WHOLE_DY;
      var toY = fromY + mm;
      if (thread.cx >= d.x) {
        if (fromY <= thread.cy - thread.r && thread.cy + thread.r <= toY) { // Passed
          statusText.score++;
          ctx.level = calcLevelByScore(statusText.score); // May Lv. Up
          ctx.needleDS[1].height = getMmByLevel(ctx.level);
          d.passed = true;
        } else {  // Failed
          doContinue = false;
        }
      }
    });
    return doContinue;
  };

  return {
    enableFullscreen: enableFullscreen,
    init: init
  };
})();
