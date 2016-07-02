import d3 from 'd3'
import 'd3-jetpack'

(function($window, $document) {
  'use strict';

  const THIRTY_FPS = 1000.0 / 30.0;
  const SCR_INITIAL = 1;
  const SCR_SELECT_MODE = 2;
  const SCR_RUNNING = 3;
  const SCR_GAMEOVER = 4;
  const EASY_MODE = 'EASY';
  const NORMAL_MODE = 'NORMAL';
  const HARD_MODE = 'HARD';
  const LUNATIC_MODE = 'LUNATIC';
  const NEEDLE_HOLE_DY = 1;
  let $svg;
  let ctx;
  let screenDispatcher;
  let selectedMode = '';

  const init = function init() {
    screenDispatcher = new ScreenDispatcher();
    screenDispatcher.register(SCR_INITIAL, new InitialScreen());
    screenDispatcher.register(SCR_SELECT_MODE, new SelectModeScreen());
    screenDispatcher.register(SCR_RUNNING, new RunningScreen());
    screenDispatcher.register(SCR_GAMEOVER, new GameOverScreen());

    const svgDS = getSvgDS();
    $svg = d3.select("body").select("svg")
      .on('touchstart keydown mousedown', screenDispatcher.touchStart)
      .on('touchend keyup mouseup', screenDispatcher.touchEnd)
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);

    ctx = getInitVars(NORMAL_MODE);
    screenDispatcher.changeScreen(SCR_INITIAL);
  };

  const randNumBetween = function randNumBetween(start, end) {
    return Math.random() * (end - start) + start;
  };

  const cloneObject = function cloneObject(obj) {
    if (typeof obj !== 'object') return obj;
    let newObj = {}, key;
    for (key in obj) {
      newObj[key] = cloneObject(obj[key]);
    }
    return newObj;
  };

  const assert = function assert(cond, msg) {
    if (!cond) {
      throw new Error('Assertion Error' + (msg ? ': ' + msg : ''));
    }
  };

  const shouldAnimate = function shouldAnimate(dataset) {
    if (dataset && !dataset.animate)
      return false;
    return ctx.animateGlobal;
  };

  const getSvgDS = function getSvgDS() {
    return {
      width: 320,
      height: 320
    };
  };

  const getInitVars = function getInitVars(mode) {
    const svgDS = getSvgDS();
    let scoreMmMap, needleDx, threadDy;
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

  const enableFullscreen = function enableFullscreen() {
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
  };

  // ======================= ScreenDispatcher =======================
  // * Dispatches *Screen instances' methods.
  // * Changes current screen ID.

  const ScreenDispatcher = function ScreenDispatcher() {
    const screens = {};
    let currentScreenId = SCR_INITIAL;

    this.register = function register(id, func) {
      screens[id] = func;
    };

    this.changeScreen = function changeScreen(id) {
      // Clear timer
      if (ctx.theTimer) {
        clearInterval(ctx.theTimer);
        ctx.theTimer = null;
      }
      const screen = screens[id];
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
      screens[currentScreenId].touchStart(...arguments);
    };

    this.touchEnd = function touchEnd() {
      screens[currentScreenId].touchEnd(...arguments);
    };
  };

  const InitialScreen = function InitialScreen() {
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
    let blink = true;
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

  const SelectModeScreen = function SelectModeScreen() {
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

  const RunningScreen = function RunningScreen() {
    this.init = function init() {
      drawLevelUpText(getLevelUpText());
      drawThread(getThread());
      makeNeedles();
      drawNeedles(getNeedles());
      drawStatusText(getStatusText());
    };
    this.update = function update() {
      // Move objects
      let doContinue = moveThread();
      moveNeedles();
      const oldLevel = ctx.level;
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

  const GameOverScreen = function GameOverScreen() {
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

  const getPressStart = function getPressStart() {
    return $svg.selectAll('#pressStart').data(ctx.pressStartDS);
  };

  const movePressStart = function movePressStart() {
    const dataset = ctx.pressStartDS[0];
    const bbox = document.getElementById('pressStart').getBBox();
    dataset.x = ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = ctx.svgDS.height / 2 - bbox.height / 2;
  };

  const drawPressStart = function drawPressStart($pressStart) {
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

  const getLevelUpText = function getLevelUpText() {
    return $svg.selectAll('#levelUp').data(ctx.levelUpDS);
  };

  const moveLevelUpText = function moveLevelUpText(show) {
    const dataset = ctx.levelUpDS[0];
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

  const drawLevelUpText = function drawLevelUpText($pressStart) {
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

  const getSelectModeScreen = function getSelectModeScreen() {
    return $svg.selectAll('.selectModeScreen').data(ctx.selectModeScreenDS);
  };

  const makeSelectModeScreen = function makeSelectModeScreen() {
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

  const clearSelectModeScreen = function clearSelectModeScreen() {
    ctx.selectModeScreenDS = [];
    ctx.selectModeButtonRectDS = [];
    ctx.selectModeButtonTextDS = [];
  };

  const drawSelectModeScreen = function drawSelectModeScreen($selectModeScreen) {
    // Enter
    $selectModeScreen.enter()
      .append('g.selectModeScreen')
      .append('rect')
        .attr('x', function(d) { return 0; })
        .attr('y', function(d) { return 0; })
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'))

    const selectMode = function() {
      const mode = d3.select(this).attr('data-mode');
      if (mode !== '') selectedMode = mode;
    };
    $selectModeScreen
      .selectAll('rect.selectModeButtonRectDS')
      .data(ctx.selectModeButtonRectDS)
      .enter().append('rect.selectModeButtonRectDS')
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
      .selectAll('text.selectModeButtonTextDS.disable-select')
      .data(ctx.selectModeButtonTextDS)
      .enter().append('text.selectModeButtonTextDS.disable-select')
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

  const makeNeedles = function makeNeedles() {
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    const needleNum = Math.floor(ctx.svgDS.width / ctx.scoreMmMap[0][2] + 2);
    // First object is placed at 'ctx.svgDS.width'.
    let objX = ctx.svgDS.width;
    for (let i = 0; i < needleNum; i++) {
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
  const getNeedles = function getNeedles() {
    return $svg.selectAll('g.needle').data(ctx.needleGroupDS);
  };

  const moveNeedles = function moveNeedles() {
    let willMove = -1;
    let maxRightX = -1;
    let rightsideNeedleNum = 0;
    const thread = ctx.threadDS[0];
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
      const nextLvScore = getScoreByLevel(ctx.level + 1);
      const level = getCurrentScore() + rightsideNeedleNum >= nextLvScore ?
                    ctx.level + 1 : ctx.level;
      const distanceX = getDistanceXByLevel(level);
      const mm = getMmByLevel(level);
      // Move the needle to the right.
      const needleGroupDS = ctx.needleGroupDS[willMove];
      needleGroupDS.x = maxRightX + distanceX;
      needleGroupDS.y = randNumBetween(0, ctx.svgDS.height - mm);
      needleGroupDS.animate = false;
      needleGroupDS.passed = false;
      if (level > ctx.level) {
        // Change next level needle's height.
        const needlePoleDS = ctx.needlePoleDS[willMove];
        needlePoleDS.height = mm;
        // Add a new needle if necessary.
        const nextNeedleNum = Math.floor(ctx.svgDS.width / getDistanceXByLevel(ctx.level + 1) + 2);
        assert(nextNeedleNum >= ctx.needleGroupDS.length,
              'Lv.UP must not cause getMmByLevel() to be smaller number');
        if (nextNeedleNum > ctx.needleGroupDS.length) {
          // Re-calculate the necessary number of needles.
          const necessaryNeedleNum = nextNeedleNum - ctx.needleGroupDS.length;
          let objX = needleGroupDS.x + distanceX;
          for (let i = 0; i < necessaryNeedleNum; i++) {
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

  const drawNeedles = function drawNeedles($needles) {
    // Enter
    $needles.enter().append('g.needle');
    const $needlePoles = $needles.selectAll('g.needle rect.pole').data(ctx.needlePoleDS);
    $needlePoles
      .enter().append('rect.pole')
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'));
    const $needleHoles = $needles.selectAll('g.needle rect.hole').data(ctx.needleHoleDS);
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
          .attr('transform', `translate(${d.x},${d.y})`);
    });
    $needleHoles.attr('height', d3.f('height'));

    // Exit
    $needles.exit().remove();
  };

  // ======================= Thread =======================
  // * Get / Move / Draw thread object

  const getThread = function getThread() {
    return $svg.selectAll('.thread').data(ctx.threadDS);
  };

  const moveThread = function moveThread() {
    const dataset = ctx.threadDS[0];
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

  const drawThread = function drawThread($thread) {
    // Enter
    $thread.enter().append('circle.thread')
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', d3.f('r'))
      .attr('fill', d3.f('fill'));
    // Update
    $thread.transition().duration(shouldAnimate() ? THIRTY_FPS : 0)
      .attr('transform', function(d) {
        return `translate(${d.cx},${d.cy})`;
      });
  };

  // ======================= "GAME OVER" text =======================
  // * Get / Move / Draw "GAME OVER" text

  const getGameOver = function getGameOver() {
    return $svg.selectAll('#gameOver').data(ctx.gameOverDS);
  };

  const moveGameOver = function moveGameOver() {
    const dataset = ctx.gameOverDS[0];
    const bbox = document.getElementById('gameOver').getBBox();
    dataset.x = ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = ctx.svgDS.height / 2 - bbox.height / 2;
  };

  const drawGameOver = function drawGameOver($gameover) {
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

  const getStatusText = function getStatusText() {
    return $svg.selectAll('#statusText').data(ctx.statusTextDS);
  };

  // score -> level -> mm
  const calcLevelByScore = function calcLevelByScore(score) {
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
  const getCurrentScore = function getCurrentScore() {
    return ctx.statusTextDS[0].score;
  };

  // @returns Least score
  // @seealso ctx.scoreMmMap
  const getScoreByLevel = function getScoreByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][0];
  };

  // @returns Hole height (mm)
  //          NOTE: Actually returns 'px' number, not 'mm' ... ;)
  // @seealso ctx.scoreMmMap
  const getMmByLevel = function getMmByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][1];
  };

  // @returns distanceX
  // @seealso ctx.scoreMmMap
  const getDistanceXByLevel = function getDistanceXByLevel(level) {
    level = Math.min(level, ctx.scoreMmMap.length - 1);
    return ctx.scoreMmMap[level][2];
  };

  const drawStatusText = function drawStatusText($statusText) {
    // Enter
    $statusText.enter().append('text#statusText.disable-select')
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('font-size', d3.f('fontSize'));
    // Update
    const mm = getMmByLevel(ctx.level);
    const distanceX = getDistanceXByLevel(ctx.level);
    $statusText
      .text(function(d) { return `${d.mode} ${d.score}本 針穴${mm}mm 距離${distanceX}m`; });
  };

  // ======================= Collision detection =======================

  // Detect collisions with thread & needles.
  const detectCollision = function detectCollision() {
    let doContinue = true;
    const thread = ctx.threadDS[0];
    const statusText = ctx.statusTextDS[0];
    getNeedles().each(function(d) {
      if (d.passed) return;
      const mm = getMmByLevel(ctx.level);
      const fromY = d.y + NEEDLE_HOLE_DY;
      const toY = fromY + mm;
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

  $window.onload = init;
  $document.getElementById('fullscreen-btn').onclick = enableFullscreen;
})(window, document);
