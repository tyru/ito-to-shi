import ScreenDispatcher from './screenDispatcher.js'
import NeedleSelection from './selection/needle.js'
import ThreadSelection from './selection/thread.js'
import GameOverSelection from './selection/gameOver.js'
import PressStartSelection from './selection/pressStart.js'
import LevelUpSelection from './selection/levelUp.js'
import SelectModeScreenSelection from './selection/selectModeScreen.js'
import StatusSelection from './selection/status.js'
import InitialScreen from './screen/initial.js'
import SelectModeScreen from './screen/selectMode.js'
import RunningScreen from './screen/running.js'
import GameOverScreen from './screen/gameOver.js'


export let $svg;
export function initSvgRoot(v) {
  return $svg = v;
}

export let ctx;
export function initContext(v) {
  return ctx = v;
}

export let selectedMode = '';
export function setSelectedMode(v) {
  return selectedMode = v;
}

export function getSvgDS() {
  return {
    width: 320,
    height: 320
  };
}

export function getInitVars(mode) {
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
}

// @returns Least score
// @seealso ctx.scoreMmMap
export function getScoreByLevel(level) {
  level = Math.min(level, ctx.scoreMmMap.length - 1);
  return ctx.scoreMmMap[level][0];
}

// @returns Hole height (mm)
//          NOTE: Actually returns 'px' number, not 'mm' ... ;)
// @seealso ctx.scoreMmMap
export function getMmByLevel(level) {
  level = Math.min(level, ctx.scoreMmMap.length - 1);
  return ctx.scoreMmMap[level][1];
}

// @returns distanceX
// @seealso ctx.scoreMmMap
export function getDistanceXByLevel(level) {
  level = Math.min(level, ctx.scoreMmMap.length - 1);
  return ctx.scoreMmMap[level][2];
}

export const THIRTY_FPS = 1000.0 / 30.0;
export const SCR_INITIAL = 1;
export const SCR_SELECT_MODE = 2;
export const SCR_RUNNING = 3;
export const SCR_GAMEOVER = 4;
export const EASY_MODE = 'EASY';
export const NORMAL_MODE = 'NORMAL';
export const HARD_MODE = 'HARD';
export const LUNATIC_MODE = 'LUNATIC';
export const NEEDLE_HOLE_DY = 1;

export const needleSelection = new NeedleSelection();
export const threadSelection = new ThreadSelection();
export const gameOverSelection = new GameOverSelection();
export const pressStartSelection = new PressStartSelection();
export const levelUpSelection = new LevelUpSelection();
export const selectModeScreenSelection = new SelectModeScreenSelection();
export const statusSelection = new StatusSelection();
export const screenDispatcher = (() => {
  let dispatcher = new ScreenDispatcher(SCR_INITIAL);
  dispatcher.register(SCR_INITIAL, new InitialScreen());
  dispatcher.register(SCR_SELECT_MODE, new SelectModeScreen());
  dispatcher.register(SCR_RUNNING, new RunningScreen());
  dispatcher.register(SCR_GAMEOVER, new GameOverScreen());
  return dispatcher;
})()
