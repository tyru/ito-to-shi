import d3 from 'd3'
import 'd3-jetpack'
import * as constant from './constant.js'

import NeedleSelection from './selection/needle.js'
import ThreadSelection from './selection/thread.js'
import GameOverSelection from './selection/gameOver.js'
import PressStartSelection from './selection/pressStart.js'
import LevelUpSelection from './selection/levelUp.js'
import SelectModeScreenSelection from './selection/selectModeScreen.js'
import StatusSelection from './selection/status.js'

import ScreenDispatcher from './screenDispatcher.js'

import InitialScreen from './screen/initial.js'
import SelectModeScreen from './screen/selectMode.js'
import RunningScreen from './screen/running.js'
import GameOverScreen from './screen/gameOver.js'


export let app = undefined;
export function runApp() {
  app = new App();
  app.run();
}


const EASY_MODE = 'EASY';
const NORMAL_MODE = 'NORMAL';
const HARD_MODE = 'HARD';
const LUNATIC_MODE = 'LUNATIC';

class App {
  constructor() {
    this._screenDispatcher = new ScreenDispatcher(constant.SCR_INITIAL);
    this._screenDispatcher.register(constant.SCR_INITIAL, new InitialScreen());
    this._screenDispatcher.register(constant.SCR_SELECT_MODE, new SelectModeScreen());
    this._screenDispatcher.register(constant.SCR_RUNNING, new RunningScreen());
    this._screenDispatcher.register(constant.SCR_GAMEOVER, new GameOverScreen());
    this._needleSelection = new NeedleSelection();
    this._threadSelection = new ThreadSelection();
    this._gameOverSelection = new GameOverSelection();
    this._pressStartSelection = new PressStartSelection();
    this._levelUpSelection = new LevelUpSelection();
    this._selectModeScreenSelection = new SelectModeScreenSelection();
    this._statusSelection = new StatusSelection();

    const svgDS = this._getSvgDS();
    this._$svg = d3.select("body").select("svg")
      .on('touchstart keydown mousedown', () => this._screenDispatcher.touchStart())
      .on('touchend keyup mouseup', () => this._screenDispatcher.touchEnd())
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);
    this._ctx = this._getInitVars(NORMAL_MODE);
    this._selectedMode = '';
  }

  // NOTE: This process must be invoked after 'app' variable is defined.
  // (Thus this cannot be called inside constructor)
  run() {
    this._screenDispatcher.changeScreen(constant.SCR_INITIAL);
  }

  initContext(mode) {
    return this._ctx = this._getInitVars(mode);
  }

  get screenDispatcher() { return this._screenDispatcher; }
  set screenDispatcher(v) { return this._screenDispatcher = v; }
  get needleSelection() { return this._needleSelection; }
  set needleSelection(v) { return this._needleSelection = v; }
  get threadSelection() { return this._threadSelection; }
  set threadSelection(v) { return this._threadSelection = v; }
  get gameOverSelection() { return this._gameOverSelection; }
  set gameOverSelection(v) { return this._gameOverSelection = v; }
  get pressStartSelection() { return this._pressStartSelection; }
  set pressStartSelection(v) { return this._pressStartSelection = v; }
  get levelUpSelection() { return this._levelUpSelection; }
  set levelUpSelection(v) { return this._levelUpSelection = v; }
  get selectModeScreenSelection() { return this._selectModeScreenSelection; }
  set selectModeScreenSelection(v) { return this._selectModeScreenSelection = v; }
  get statusSelection() { return this._statusSelection; }
  set statusSelection(v) { return this._statusSelection = v; }
  get $svg() { return this._$svg; }
  set $svg(v) { return this._$svg = v; }
  get ctx() { return this._ctx; }
  set ctx(v) { return this._ctx = v; }
  get selectedMode() { return this._selectedMode; }
  set selectedMode(v) { this._selectedMode = v; }

  _getInitVars(mode) {
    const svgDS = this._getSvgDS();
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
        x: 2, y: constant.NEEDLE_HOLE_DY, fill: 'white',
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

  _getSvgDS() {
    return {
      width: 320,
      height: 320
    };
  }

  // @returns Least score
  // @seealso this.ctx.scoreMmMap
  getScoreByLevel(level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1);
    return this.ctx.scoreMmMap[level][0];
  }

  // @returns Hole height (mm)
  //          NOTE: Actually returns 'px' number, not 'mm' ... ;)
  // @seealso this.ctx.scoreMmMap
  getMmByLevel(level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1);
    return this.ctx.scoreMmMap[level][1];
  }

  // @returns distanceX
  // @seealso this.ctx.scoreMmMap
  getDistanceXByLevel(level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1);
    return this.ctx.scoreMmMap[level][2];
  }
}