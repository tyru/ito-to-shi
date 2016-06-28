window.ItoToShi = (function() {
  'use strict';

  var INTERVAL_AT_INITIAL = 500;
  var INTERVAL_AT_SELECT_MODE = 1000.0 / 30.0;
  var INTERVAL_AT_RUNNING = 1000.0 / 30.0;
  var SCR_INITIAL = 1;
  var SCR_SELECT_MODE = 2;
  var SCR_RUNNING = 3;
  var SCR_GAMEOVER = 4;
  var EASY_MODE = 'EASY';
  var NORMAL_MODE = 'NORMAL';
  var HARD_MODE = 'HARD';
  var LUNATIC_MODE = 'LUNATIC';
  var NEEDLE_WHOLE_DY = 1;
  var $svg;
  var ctx;

  var init = function init() {
    ctx = getInitVars(HARD_MODE);
    changeScreen(SCR_INITIAL);
  };

  var randNumBetween = function randNumBetween(start, end) {
    return Math.random() * (end - start) + start;
  };

  var assert = function assert(cond, msg) {
    if (!cond) {
      throw new Error('Assertion Error' + (msg ? ': ' + msg : ''));
    }
  };

  var getInitVars = function getInitVars(mode) {
    var svgDS = {
      width: 320,
      height: 320
    };
    var scoreMmMap, needleDx, threadDy;
    if (mode === EASY_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0  , 150, 320],
        [10 , 140, 300],
        [20 , 120, 280],
        [40 , 110, 260],
        [80 , 100, 240],
        [100,  90, 220]
      ];
      needleDx = -5;
      threadDy = 1;
    } else if (mode === NORMAL_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0  , 120, 260],
        [10 , 110, 240],
        [20 , 100, 220],
        [40 ,  90, 200],
        [80 ,  80, 180],
        [100,  70, 160]
      ];
      needleDx = -5;
      threadDy = 1;
    } else if (mode === HARD_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0  , 100, 200],
        [10 ,  90, 180],
        [20 ,  80, 160],
        [40 ,  70, 140],
        [80 ,  60, 140],
        [100,  50, 140]
      ];
      needleDx = -5;
      threadDy = 1;
    } else if (mode === LUNATIC_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0  , 100, 200],
        [10 ,  90, 180],
        [20 ,  80, 160],
        [40 ,  70, 140],
        [80 ,  60, 140],
        [100,  50, 140]
      ];
      needleDx = -7.5;
      threadDy = 1.5;
    } else {
      throw 'unknown mode!';
    }
    // Generate needle objects.
    var needleGroupDS = [];
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    var needleNum = Math.floor(svgDS.width / scoreMmMap[0][2] + 2);
    // First object is placed at 'svgDS.width'.
    var objX = svgDS.width;
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
        fill: 'red', cx: svgDS.width * 0.33, cy: svgDS.height * 0.33, r: 5, a: 1
      }],
      statusTextDS: [{  // <text>
        x: 60, y: 12, fontSize: '12px', text: '',
        score: 0, mode: mode
      }],
      scoreMmMap: scoreMmMap,
      level: 0,
      gameOverDS: [{  // <text>
        x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
      }],
      needleDx: needleDx,
      needleGapX: -10,
      Da: threadDy,
      minA: -10,
      maxA: 10,
      hovering: false,
      threadGameOverGapY: 10,
      theTimer: null
    };
  };

  var touchFn;
  // 1. Initial -> (unset isInitial) -> Running
  // 2. Running -> (set hovering) -> Running
  // 3. Stopped -> Running
  // 4. GameOver -> Initial -> (unset isInitial) -> Running
  var touchStart = function touchStart() {
    d3.event.preventDefault();    // Don't propagate click event to outside <svg> tag
    touchFn();
  };

  var changeScreen = function changeScreen(screen) {
    if (screen === SCR_INITIAL) {
      // Update draw function
      if (ctx.theTimer) clearInterval(ctx.theTimer);
      ctx.theTimer = setInterval(updateAtInitial, INTERVAL_AT_INITIAL);
      // Update touch function
      touchFn = touchStartAtInitial;

    // TODO
    // } else if (screen === SCR_SELECT_MODE) {
    //   // Update draw function
    //   if (ctx.theTimer) clearInterval(ctx.theTimer);
    //   ctx.theTimer = setInterval(updateAtSelectMode, INTERVAL_AT_SELECT_MODE);
    //   // Update touch function
    //   touchFn = touchStartAtSelectMode;

    } else if (screen === SCR_SELECT_MODE || screen === SCR_RUNNING) {
      // Update draw function
      if (ctx.theTimer) clearInterval(ctx.theTimer);
      ctx.theTimer = setInterval(updateAtRunning, INTERVAL_AT_RUNNING);
      // Update touch function
      touchFn = touchStartAtRunning;

    } else if (screen === SCR_GAMEOVER) {
      // Update draw function
      if (ctx.theTimer) clearInterval(ctx.theTimer);
      updateAtGameOver();
      // ctx.theTimer = null;
      // ctx.theTimer = setInterval(updateAtGameOver, INTERVAL_AT_GAMEOVER);
      // Update touch function
      touchFn = touchStartAtGameOver;
    }
  };

  var touchStartAtInitial = function touchStartAtInitial() {
    changeScreen(SCR_SELECT_MODE);
  };

  var updateAtInitial = function updateAtInitial() {
    console.log('updateAtInitial() enter');
    // Draw initial screen
    $svg = d3.select("body").select("svg")
      .on('touchstart', touchStart)
      .on('touchend', touchEnd)
      .on('keydown', touchStart)
      .on('keyup', touchEnd)
      .on('mousedown', touchStart)
      .on('mouseup', touchEnd)
      .attr('width', ctx.svgDS.width)
      .attr('height', ctx.svgDS.height);
    drawThread(getThread());
    drawNeedles(getNeedles());
    drawStatusText(getStatusText());
    drawGameOver(getGameOver());
  };

  var touchStartAtSelectMode = function touchStartAtSelectMode() {
    changeScreen(SCR_RUNNING);
  };

  var touchStartAtRunning = function touchStartAtRunning() {
    ctx.hovering = true;
  };

  var updateAtRunning = function updateAtRunning() {
    console.log('updateAtRunning() enter');
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
      changeScreen(SCR_GAMEOVER);
    }
  };

  var touchStartAtGameOver = function touchStartAtGameOver() {
    init();
    drawGameOver(getGameOver());
    changeScreen(SCR_RUNNING);
  };

  var updateAtGameOver = function updateAtGameOver() {
    moveGameOver();
    drawGameOver(getGameOver());
  };

  var touchEnd = function touchEnd() {
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
          .transition().duration(d.animate ? INTERVAL_AT_RUNNING : 0)
          .attr('transform', 'translate(' + d.x + ',' + d.y + ')');
    });

    $needleChildren
      .transition().duration(INTERVAL_AT_RUNNING * 3)
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
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', function(d) { return d.r; })
      .attr('fill', function(d) { return d.fill; });
    // Update
    $thread.transition().duration(INTERVAL_AT_RUNNING)
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
      .text(function(d) { return d.mode + ' ' + d.score + '本 針穴' + mm + 'mm 距離' + distanceX + 'm'; });
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

window.onload = window.ItoToShi.init;
