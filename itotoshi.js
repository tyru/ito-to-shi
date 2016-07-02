window.ItoToShi = (function() {
  'use strict';

  var THIRTY_FPS = 1000.0 / 30.0;
  var SCR_INITIAL = 1;
  var SCR_SELECT_MODE = 2;
  var SCR_RUNNING = 3;
  var SCR_GAMEOVER = 4;
  var EASY_MODE = 'EASY';
  var NORMAL_MODE = 'NORMAL';
  var HARD_MODE = 'HARD';
  var LUNATIC_MODE = 'LUNATIC';
  var NEEDLE_HOLE_DY = 1;
  var $svg;
  var ctx;
  var screenDispatcher;
  var selectedMode = '';

  var init = function init() {
    screenDispatcher = new ScreenDispatcher();
    screenDispatcher.register(SCR_INITIAL, new InitialScreen());
    screenDispatcher.register(SCR_SELECT_MODE, new SelectModeScreen());
    screenDispatcher.register(SCR_RUNNING, new RunningScreen());
    screenDispatcher.register(SCR_GAMEOVER, new GameOverScreen());

    var svgDS = getSvgDS();
    $svg = d3.select("body").select("svg")
      .on('touchstart keydown mousedown', screenDispatcher.touchStart)
      .on('touchend keyup mouseup', screenDispatcher.touchEnd)
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);

    ctx = getInitVars(NORMAL_MODE);
    screenDispatcher.changeScreen(SCR_INITIAL);
  };

  var randNumBetween = function randNumBetween(start, end) {
    return Math.random() * (end - start) + start;
  };

  var cloneObject = function cloneObject(obj) {
    if (typeof obj !== 'object') return obj;
    var newObj = {}, key;
    for (key in obj) {
      newObj[key] = cloneObject(obj[key]);
    }
    return newObj;
  }

  var assert = function assert(cond, msg) {
    if (!cond) {
      throw new Error('Assertion Error' + (msg ? ': ' + msg : ''));
    }
  };

  var shouldAnimate = function shouldAnimate(dataset) {
    if (dataset && !dataset.animate)
      return false;
    return ctx.animateGlobal;
  };

  var getSvgDS = function getSvgDS() {
    return {
      width: 320,
      height: 320
    };
  };

  var getInitVars = function getInitVars(mode) {
    var svgDS = getSvgDS();
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

    return {
      svgDS: svgDS,
      needleGroupDS: [], // <g>
      needlePoleDS: [], // <rect>
      needleHoleDS: [], // <rect>
      needlePoleDSTemplate: {  // <rect>
        x: 0, y: 0, fill: 'gray', width: 10, height: svgDS.height, animate: true
      },
      needleHoleDSTemplate: {  // <rect>
        x: 2, y: NEEDLE_HOLE_DY, fill: 'white',
        width: 6, height: scoreMmMap[0][1], animate: true
      },
      threadDS: [{  // <circle>
        fill: 'red', cx: svgDS.width * 0.33, cy: svgDS.height * 0.33, r: 5, a: 1
      }],
      statusTextDS: [{  // <text>
        x: 60, y: 12, fontSize: '12px', text: '',
        score: 0, mode: mode
      }],
      levelUpDS: [{  // <text>
        x: -99, y: -99, fontSize: '18px', text: 'Lv. UP', fill: 'red',
        dy: -1, hoverHeight: 20
      }],
      gameOverDS: [],    // <text>
      selectModeScreenDS: [],    // <g>
      selectModeButtonRectDS: [],    // <rect>
      selectModeButtonTextDS: [],    // <text>
      pressStartDS: [],    // <text>
      scoreMmMap: scoreMmMap,
      level: 0,
      needleDx: needleDx,
      needleGapX: -10,
      Da: threadDy,
      minA: -10,
      maxA: 10,
      hovering: false,
      threadGameOverGapY: 10,
      theTimer: null,
      animateGlobal: true
    };
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

  // ======================= ScreenDispatcher =======================
  // * Dispatches *Screen instances' methods.
  // * Changes current screen ID.

  var ScreenDispatcher = function ScreenDispatcher() {
    var screens = {};
    var currentScreenId = SCR_INITIAL;

    this.register = function register(id, func) {
      screens[id] = func;
    };

    this.changeScreen = function changeScreen(id) {
      // Clear timer
      if (ctx.theTimer) {
        clearInterval(ctx.theTimer);
        ctx.theTimer = null;
      }
      var screen = screens[id];
      if (!screen) {
        return;
      }
      // Call init functions
      if (screen.init) {
        ctx.animateGlobal = false;
        screen.init();
        ctx.animateGlobal = true;
      }
      // Update draw function
      if (screen.update && screen.getInterval) {
        ctx.theTimer = setInterval(screen.update, screen.getInterval());
      }
      currentScreenId = id;
    };

    this.touchStart = function touchStart() {
      d3.event.preventDefault();    // Don't propagate click event to outside <svg> tag
      screens[currentScreenId].touchStart.apply(this, arguments);
    };

    this.touchEnd = function touchEnd() {
      screens[currentScreenId].touchEnd.apply(this, arguments);
    };
  };

  var InitialScreen = function InitialScreen() {
    this.init = function init() {
      drawThread(getThread());
      makeNeedles();
      drawNeedles(getNeedles());
      drawStatusText(getStatusText());

      // Draw at hidden point to get bbox width & height.
      ctx.pressStartDS = [{  // <text>
        x: -99, y: -99, fontSize: '24px', text: 'PRESS START',
        fill: 'black'
      }];
      drawPressStart(getPressStart());
      // Move to visible point
      movePressStart();
      drawPressStart(getPressStart());
    };
    var blink = true;
    this.update = function update() {
      blink = !blink;

    };
    this.getInterval = function getInterval() {
      return 500;
    };
    this.touchStart = function touchStart() {
      ctx.pressStartDS = [];
      drawPressStart(getPressStart());
      screenDispatcher.changeScreen(SCR_SELECT_MODE);
    };
    this.touchEnd = function touchEnd() {
    };
  };

  var SelectModeScreen = function SelectModeScreen() {
    this.init = function init() {
      makeSelectModeScreen();
      drawSelectModeScreen(getSelectModeScreen());
    };
    this.touchStart = function touchStart() {
      if (selectedMode !== '') {
        ctx = getInitVars(selectedMode);
        clearSelectModeScreen(getSelectModeScreen());
        drawSelectModeScreen(getSelectModeScreen());
        screenDispatcher.changeScreen(SCR_RUNNING);
      }
    };
    this.touchEnd = function touchEnd() {
    };
  };

  var RunningScreen = function RunningScreen() {
    this.init = function init() {
      drawLevelUpText(getLevelUpText());
      drawThread(getThread());
      makeNeedles();
      drawNeedles(getNeedles());
      drawStatusText(getStatusText());
    };
    this.update = function update() {
      // Move objects
      var doContinue = moveThread();
      moveNeedles();
      var oldLevel = ctx.level;
      doContinue = detectCollision() && doContinue;
      moveLevelUpText(oldLevel !== ctx.level);
      // Update screen
      drawThread(getThread());
      drawNeedles(getNeedles());
      drawStatusText(getStatusText());
      drawLevelUpText(getLevelUpText());
      // GAME OVER
      if (!doContinue) {
        screenDispatcher.changeScreen(SCR_GAMEOVER);
      }
    };
    this.getInterval = function getInterval() {
      return THIRTY_FPS;
    };
    this.touchStart = function touchStart() {
      ctx.hovering = true;
    };
    this.touchEnd = function touchEnd() {
      ctx.hovering = false;
    };
  };

  var GameOverScreen = function GameOverScreen() {
    var that = this;
    this.init = function init() {
      // Draw at hidden point to get bbox width & height.
      ctx.gameOverDS = [{  // <text>
        x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
      }];
      drawGameOver(getGameOver());
      // Move to visible point
      moveGameOver();
      drawGameOver(getGameOver());
    };
    this.touchStart = function touchStart() {
      ctx = getInitVars(selectedMode);
      drawGameOver(getGameOver());
      screenDispatcher.changeScreen(SCR_RUNNING);
    };
    this.touchEnd = function touchEnd() {
    };
  };

  // ======================= (Initial screen) "PRESS START" text =======================
  // * Get / Move / Draw "PRESS START" text object

  var getPressStart = function getPressStart() {
    return $svg.selectAll('#pressStart').data(ctx.pressStartDS);
  };

  var movePressStart = function movePressStart() {
    var dataset = ctx.pressStartDS[0];
    var bbox = document.getElementById('pressStart').getBBox();
    dataset.x = ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = ctx.svgDS.height / 2 - bbox.height / 2;
  };

  var drawPressStart = function drawPressStart($pressStart) {
    // Enter
    $pressStart.enter().append('text#pressStart.disable-select')
      .attr('font-size', d3.f('fontSize'))
      .text(d3.f('text'));

    // Exit
    $pressStart.exit().remove();

    // Update
    $pressStart
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('fill', d3.f('fill'))
  };

  // ======================= (Running screen) "Lv. UP" text =======================
  // * Get / Move / Draw "Lv. UP" text object

  var getLevelUpText = function getLevelUpText() {
    return $svg.selectAll('#levelUp').data(ctx.levelUpDS);
  };

  var moveLevelUpText = function moveLevelUpText(show) {
    var dataset = ctx.levelUpDS[0];
    if (show) { // Start
      dataset.x = ctx.threadDS[0].cx;
      dataset.y = ctx.threadDS[0].cy;
      dataset.endY = dataset.y - dataset.hoverHeight;
    } else if (dataset.y >= dataset.endY) { // Hovering
      dataset.y += dataset.dy;
    } else if (dataset.endY) { // End
      dataset.x = dataset.y = -99;
      delete dataset.endY;
    }
  };

  var drawLevelUpText = function drawLevelUpText($pressStart) {
    // Enter
    $pressStart.enter().append('text#levelUp.disable-select')
      .attr('style', 'font-weight: bold;')
      .attr('font-size', d3.f('fontSize'))
      .text(d3.f('text'));

    // Exit
    $pressStart.exit().remove();

    // Update
    $pressStart
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('fill', d3.f('fill'))
  };

  // ======================= Select mode screen =======================
  // * Get / Move / Draw select mode object

  var getSelectModeScreen = function getSelectModeScreen() {
    return $svg.selectAll('.selectModeScreen').data(ctx.selectModeScreenDS);
  };

  var makeSelectModeScreen = function makeSelectModeScreen() {
    ctx.selectModeScreenDS = [{
      x: 0, y: 0, fill: 'black', width: ctx.svgDS.width, height: ctx.svgDS.height
    }];
    ctx.selectModeButtonRectDS = [
      {x: 40, y: 30, fill: 'green', width: 110, height: 70},
      {x: 180, y: 30, fill: 'blue', width: 110, height: 70},
      {x: 40, y: 130, fill: 'red', width: 110, height: 70},
      {x: 180, y: 130, fill: 'purple', width: 110, height: 70}
    ];
    ctx.selectModeButtonTextDS = [
      {x: 60, y: 70, fontSize: '24px', text: 'EASY', fill: 'white'},
      {x: 190, y: 70, fontSize: '24px', text: 'NORMAL', fill: 'white'},
      {x: 60, y: 170, fontSize: '24px', text: 'HARD', fill: 'white'},
      {x: 190, y: 170, fontSize: '24px', text: 'LUNATIC', fill: 'white'}
    ];
  };

  var clearSelectModeScreen = function clearSelectModeScreen() {
    ctx.selectModeScreenDS = [];
    ctx.selectModeButtonRectDS = [];
    ctx.selectModeButtonTextDS = [];
  };

  var drawSelectModeScreen = function drawSelectModeScreen($selectModeScreen) {
    // Enter
    $selectModeScreen.enter()
      .append('g.selectModeScreen')
      .append('rect')
        .attr('x', function(d) { return 0; })
        .attr('y', function(d) { return 0; })
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'))

    var selectMode = function() {
      var mode = d3.select(this).attr('data-mode');
      if (mode !== '') selectedMode = mode;
    };
    $selectModeScreen
      .appendMany(ctx.selectModeButtonRectDS, 'rect.selectModeButtonRectDS')
        .attr('data-mode', function(_, i) {
          return ctx.selectModeButtonTextDS[i].text;
        })
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'))
        .on('touchstart mousedown', selectMode);
    $selectModeScreen
      .appendMany(ctx.selectModeButtonTextDS, 'text.selectModeButtonTextDS.disable-select')
        .attr('data-mode', d3.f('text'))
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('font-size', d3.f('fontSize'))
        .text(d3.f('text'))
        .on('touchstart mousedown', selectMode);

    // Exit
    $selectModeScreen.exit().remove();
  };

  // ======================= Needles =======================
  // * Get / Move / Draw needles objects

  var makeNeedles = function makeNeedles() {
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    var needleNum = Math.floor(ctx.svgDS.width / ctx.scoreMmMap[0][2] + 2);
    // First object is placed at 'ctx.svgDS.width'.
    var objX = ctx.svgDS.width;
    for (var i = 0; i < needleNum; i++) {
      ctx.needleGroupDS.push({
        x: objX,
        y: randNumBetween(0, ctx.svgDS.height - ctx.scoreMmMap[0][1]),
        passed: false
      });
      ctx.needlePoleDS.push(cloneObject(ctx.needlePoleDSTemplate));
      ctx.needleHoleDS.push(cloneObject(ctx.needleHoleDSTemplate));
      objX += ctx.scoreMmMap[0][2];
    }
  };

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in screen...)
  var getNeedles = function getNeedles() {
    return $svg.selectAll('g.needle').data(ctx.needleGroupDS);
  };

  var moveNeedles = function moveNeedles() {
    var willMove = -1;
    var maxRightX = -1;
    var rightsideNeedleNum = 0;
    var thread = ctx.threadDS[0];
    ctx.needleGroupDS = ctx.needleGroupDS.map(function(d, i) {
      if (d.x + ctx.needleDx < ctx.needleGapX) {
        // Next d.x is left of visible screen.
        assert(willMove === -1, '0 <= moving needles <= 1');
        willMove = i;
      } else {
        d.x += ctx.needleDx;
        d.animate = true;
      }
      if (d.x > thread.cx) rightsideNeedleNum++;
      maxRightX = Math.max(maxRightX, d.x);
      return d;
    });
    if (willMove >= 0) {
      // Move a needle to rightmost at screen.
      // Determine if I must calculate the distanceX by next level or current level.
      var nextLvScore = getScoreByLevel(ctx.level + 1);
      var level = getCurrentScore() + rightsideNeedleNum >= nextLvScore ?
                    ctx.level + 1 : ctx.level;
      var distanceX = getDistanceXByLevel(level);
      var mm = getMmByLevel(level);
      // Move the needle to the right.
      var needleGroupDS = ctx.needleGroupDS[willMove];
      needleGroupDS.x = maxRightX + distanceX;
      needleGroupDS.y = randNumBetween(0, ctx.svgDS.height - mm);
      needleGroupDS.animate = false;
      needleGroupDS.passed = false;
      if (level > ctx.level) {
        // Change next level needle's height.
        var needlePoleDS = ctx.needlePoleDS[willMove];
        needlePoleDS.height = mm;
        // Add a new needle if necessary.
        var nextNeedleNum = Math.floor(ctx.svgDS.width / getDistanceXByLevel(ctx.level + 1) + 2);
        assert(nextNeedleNum >= ctx.needleGroupDS.length,
              'Lv.UP must not cause getMmByLevel() to be smaller number');
        if (nextNeedleNum > ctx.needleGroupDS.length) {
          // Re-calculate the necessary number of needles.
          nextNeedleNum = nextNeedleNum - ctx.needleGroupDS.length;
          var objX = needleGroupDS.x + distanceX;
          for (var i = 0; i < nextNeedleNum; i++) {
            ctx.needleGroupDS.push({
              x: objX,
              y: randNumBetween(0, ctx.svgDS.height - mm),
              passed: false
            });
            ctx.needlePoleDS.push(cloneObject(ctx.needlePoleDSTemplate));
            ctx.needleHoleDS.push(cloneObject(ctx.needleHoleDSTemplate));
            objX += distanceX;
          }
        }
      }
    }
  };

  var drawNeedles = function drawNeedles($needles) {
    // Enter
    $needles.enter().append('g.needle');
    var $needlePoles = $needles.selectAll('g.needle rect.pole').data(ctx.needlePoleDS);
    $needlePoles
      .enter().append('rect.pole')
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'));
    var $needleHoles = $needles.selectAll('g.needle rect.hole').data(ctx.needleHoleDS);
    $needleHoles
      .enter().append('rect.hole')
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'));

    // Update
    // Move with animation.
    $needles.each(function(d) {
      // http://stackoverflow.com/questions/26903355/how-to-cancel-scheduled-transition-in-d3
        d3.select(this)
          .transition().duration(shouldAnimate(d) ? THIRTY_FPS : 0)
          .attr('transform', 'translate(' + d.x + ',' + d.y + ')');
    });
    $needleHoles.attr('height', d3.f('height'));

    // Exit
    $needles.exit().remove();
  };

  // ======================= Thread =======================
  // * Get / Move / Draw thread object

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
    $thread.enter().append('circle.thread')
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', d3.f('r'))
      .attr('fill', d3.f('fill'));
    // Update
    $thread.transition().duration(shouldAnimate() ? THIRTY_FPS : 0)
      .attr('transform', function(d) {
        return 'translate(' + d.cx + ',' + d.cy + ')';
      });
  };

  // ======================= "GAME OVER" text =======================
  // * Get / Move / Draw "GAME OVER" text

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
    $gameover.enter().append('text#gameOver.disable-select')
      .attr('font-size', d3.f('fontSize'))
      .text(d3.f('text'));

    // Exit
    $gameover.exit().remove();

    // Update
    $gameover
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
  };

  // ======================= Status text =======================
  // * Get / Move / Draw status text

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
    $statusText.enter().append('text#statusText.disable-select')
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('font-size', d3.f('fontSize'));
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
      var fromY = d.y + NEEDLE_HOLE_DY;
      var toY = fromY + mm;
      if (thread.cx >= d.x) {
        if (fromY <= thread.cy - thread.r && thread.cy + thread.r <= toY) { // Passed
          statusText.score++;
          ctx.level = calcLevelByScore(statusText.score); // May Lv. Up
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
