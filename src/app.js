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
  // NOTE: This process must be invoked after 'app' variable is defined.
  // (Thus this cannot be called inside constructor)
  run() {
    const svgDS = this.getSvgDS();
    this._$svg = d3.select("body").select("svg")
      .on('touchstart keydown mousedown', () => this._screenDispatcher.touchStart())
      .on('touchend keyup mouseup', () => this._screenDispatcher.touchEnd())
      .attr('width', svgDS.width)
      .attr('height', svgDS.height);
    this.initContext(NORMAL_MODE);
    this._selectedMode = '';

    // Switch to initial screen.
    this._screenDispatcher.changeScreen(constant.SCR_INITIAL);

    // Register a main loop.
    d3.timer(() => this.update());
  }

  // This is called when restart (GAME OVER -> (click)).
  initContext(mode) {
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
    this._statusSelection = new StatusSelection(mode);

    this._ctx = this._getInitVars(mode);
    this._statusSelection.setMode(mode);
    this._prevUpdatedTime = Date.now();
  }

  update() {
    // Skip if main loop was called too early.
    const now = Date.now();
    const stepFrames = Math.floor((now - this._prevUpdatedTime) / constant.THE_FPS);
    if (stepFrames > 0) {
      this._prevUpdatedTime = now;
    }
    // Update screen.
    const dispatcher = this._screenDispatcher;
    const screen = dispatcher.screens[dispatcher.screenId];
    if (screen && screen.update) {
      screen.update(stepFrames);
    }
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

  get statusTextScore() { return this._statusSelection.getScore(); }
  set statusTextScore(v) { return this._statusSelection.setScore(v); }

  get threadDS() { return this._threadSelection.getDS(); }

  _getInitVars(mode) {
    const svgDS = this.getSvgDS();
    const [scoreMmMap, needleDx, threadDy] = this._getModeContext(mode);

    return {
      svgDS: svgDS,
      scoreMmMap: scoreMmMap,
      level: 0,
      needleDx: needleDx,
      needleGapX: -10,
      Da: threadDy,
      minA: -10,
      maxA: 10,
      hovering: false,
      threadGameOverGapY: 10,
      animateGlobal: true
    };
  }

  _getModeContext(mode) {
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
    return [scoreMmMap, needleDx, threadDy];
  }

  getSvgDS() {
    return {
      width: 320,
      height: 320
    };
  }

  getInitialNeedleHoleHeight() {
    return this.getMmByLevel(0, this._getModeContext(NORMAL_MODE)[0]);
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
  // @seealso getInitialNeedleHoleHeight()
  //          (for optional argument)
  getMmByLevel(level, scoreMmMap = this.ctx.scoreMmMap) {
    level = Math.min(level, scoreMmMap.length - 1);
    return scoreMmMap[level][1];
  }

  // @returns distanceX
  // @seealso this.ctx.scoreMmMap
  getDistanceXByLevel(level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1);
    return this.ctx.scoreMmMap[level][2];
  }
}
