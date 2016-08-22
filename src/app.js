import d3 from 'd3'
import 'd3-jetpack'
import * as constant from './constant.js'
import * as util from './util.js'

import NeedleSelection from './selection/needle.js'
import ThreadSelection from './selection/thread.js'
import GameOverSelection from './selection/gameOver.js'
import PauseSelection from './selection/pause.js'
import PressStartSelection from './selection/pressStart.js'
import InitialTransparentRect from './selection/initialTransparentRect.js'
import LevelUpSelection from './selection/levelUp.js'
import SelectModeScreenSelection from './selection/selectModeScreen.js'
import StatusSelection from './selection/status.js'

import ScreenDispatcher from './screenDispatcher.js'

import InitialScreen from './screen/initial.js'
import SelectModeScreen from './screen/selectMode.js'
import PlayingScreen from './screen/playing.js'
import GameOverScreen from './screen/gameOver.js'

export let app
export function runApp () {
  app = new App()
  app.run()
}

const EASY_MODE = 'EASY'
const NORMAL_MODE = 'NORMAL'
const HARD_MODE = 'HARD'
const LUNATIC_MODE = 'LUNATIC'

class App {
  // NOTE: This process must be invoked after 'app' variable is defined.
  // (Thus this cannot be moved to constructor)
  run () {
    // Add event listeners to outside svg tag.
    // This resolves the problem that iOS Safari & Chrome can't handle
    // touchstart,touchend events at only 'Playing' screen...
    // XXX: I don't know why this problem is occurred by iOS, browser-dependant,
    // or my ignorance about web standards...;)
    const svgDS = this.getSvgDS()
    this._$svg =
      d3.select('.container')
        .on('touchstart keydown mousedown', () => this._screenDispatcher.touchStart('.container'))
        .on('touchend keyup mouseup', () => this._screenDispatcher.touchEnd())
        .on('mouseleave', () => this._screenDispatcher.mouseOut())
      .select('svg')
        .attr({
          'width': svgDS.width,
          'height': svgDS.height
        })
    this.initContext(NORMAL_MODE)

    // Switch to initial screen.
    this._screenDispatcher.changeScreen(constant.SCR_INITIAL)

    // Register a main loop.
    d3.timer(() => this.update())
  }

  // This is called when restart (GAME OVER -> (click)).
  initContext (mode) {
    this._screenDispatcher = new ScreenDispatcher(constant.SCR_INITIAL)
    this._screenDispatcher.register(constant.SCR_INITIAL, new InitialScreen())
    this._screenDispatcher.register(constant.SCR_SELECT_MODE, new SelectModeScreen())
    this._screenDispatcher.register(constant.SCR_PLAYING, new PlayingScreen())
    this._screenDispatcher.register(constant.SCR_GAMEOVER, new GameOverScreen())
    this._needleSelection = new NeedleSelection()
    this._threadSelection = new ThreadSelection()
    this._gameOverSelection = new GameOverSelection()
    this._pauseSelection = new PauseSelection()
    this._pressStartSelection = new PressStartSelection()
    this._initialTransparentRect = new InitialTransparentRect()
    this._levelUpSelection = new LevelUpSelection()
    this._selectModeScreenSelection = new SelectModeScreenSelection()
    this._statusSelection = new StatusSelection(mode)

    this._ctx = this._getInitVars(mode)
    this._statusSelection.setMode(mode)
    this._prevUpdatedTime = Date.now()
    this._selectedMode = mode
  }

  update () {
    const now = Date.now()
    const elapsedMs = now - this._prevUpdatedTime
    this._prevUpdatedTime = now
    this._screenDispatcher.update(elapsedMs)
  }

  get screenDispatcher () { return this._screenDispatcher }
  set screenDispatcher (v) { this._screenDispatcher = v }
  get needleSelection () { return this._needleSelection }
  set needleSelection (v) { this._needleSelection = v }
  get threadSelection () { return this._threadSelection }
  set threadSelection (v) { this._threadSelection = v }
  get gameOverSelection () { return this._gameOverSelection }
  set gameOverSelection (v) { this._gameOverSelection = v }
  get pauseSelection () { return this._pauseSelection }
  set pauseSelection (v) { this._pauseSelection = v }
  get pressStartSelection () { return this._pressStartSelection }
  set pressStartSelection (v) { this._pressStartSelection = v }
  get initialTransparentRect () { return this._initialTransparentRect }
  set initialTransparentRect (v) { this._initialTransparentRect = v }
  get levelUpSelection () { return this._levelUpSelection }
  set levelUpSelection (v) { this._levelUpSelection = v }
  get selectModeScreenSelection () { return this._selectModeScreenSelection }
  set selectModeScreenSelection (v) { this._selectModeScreenSelection = v }
  get statusSelection () { return this._statusSelection }
  set statusSelection (v) { this._statusSelection = v }
  get $svg () { return this._$svg }
  set $svg (v) { this._$svg = v }
  get ctx () { return this._ctx }
  set ctx (v) { this._ctx = v }
  get selectedMode () { return this._selectedMode }
  set selectedMode (v) { this._selectedMode = v }

  get statusTextScore () { return this._statusSelection.getScore() }
  set statusTextScore (v) { this._statusSelection.setScore(v) }

  get threadDS () { return this._threadSelection.getDS() }

  _getInitVars (mode) {
    const svgDS = this.getSvgDS()
    const [scoreMmMap, needleDx, threadDy] = this._getModeContext(mode)

    return {
      svgDS: svgDS,
      scoreMmMap: scoreMmMap,
      level: 0,
      needleDx: needleDx,
      needleGapX: -10,
      Da: threadDy,
      minA: -10,
      maxA: 10,
      threadGameOverGapY: 10,
      animateGlobal: true
    }
  }

  _getModeContext (mode) {
    let scoreMmMap, needleDx, threadDy
    if (mode === EASY_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0, 150, 320],
        [10, 140, 300],
        [20, 120, 280],
        [40, 110, 260],
        [80, 100, 240],
        [100, 90, 220]
      ]
      needleDx = -5
      threadDy = 1
    } else if (mode === NORMAL_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0, 120, 260],
        [10, 110, 240],
        [20, 100, 220],
        [40, 90, 200],
        [80, 80, 180],
        [100, 70, 160]
      ]
      needleDx = -5
      threadDy = 1
    } else if (mode === HARD_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0, 100, 200],
        [10, 90, 180],
        [20, 80, 160],
        [40, 70, 140],
        [80, 60, 140],
        [100, 50, 140]
      ]
      needleDx = -5
      threadDy = 1
    } else if (mode === LUNATIC_MODE) {
      scoreMmMap = [
        // [least score, hole height (mm), distanceX]
        [0, 100, 200],
        [10, 90, 180],
        [20, 80, 160],
        [40, 70, 140],
        [80, 60, 140],
        [100, 50, 140]
      ]
      needleDx = -7.5
      threadDy = 1.5
    } else {
      util.assert(false, 'unknown mode!')
    }
    return [scoreMmMap, needleDx, threadDy]
  }

  getSvgDS () {
    return {
      width: 320,
      height: 320
    }
  }

  // @return Least score
  // @seealso this.ctx.scoreMmMap
  getScoreByLevel (level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1)
    return this.ctx.scoreMmMap[level][0]
  }

  // @return Hole height (mm)
  //          NOTE: Actually returns 'px' number, not 'mm' ... )
  // @seealso this.ctx.scoreMmMap
  getMmByLevel (level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1)
    return this.ctx.scoreMmMap[level][1]
  }

  // @return distanceX
  // @seealso this.ctx.scoreMmMap
  getDistanceXByLevel (level) {
    level = Math.min(level, this.ctx.scoreMmMap.length - 1)
    return this.ctx.scoreMmMap[level][2]
  }
}
