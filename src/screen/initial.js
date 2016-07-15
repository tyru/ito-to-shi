import {app} from '../app.js'
import * as constant from '../constant.js'
import * as util from '../util.js'
import PlayingScreen from './playing.js'

export default class InitialScreen {
  constructor() {
    this._blink = true;
    this._totalElapsedMs = 0;
    this._playingScreen = new PlayingScreen();
    this._playingScreen.changeToGameOver = function changeToGameOver() {
      app.initContext(app.selectedMode);
      app.screenDispatcher.changeScreen(constant.SCR_INITIAL);
    };
  }

  init() {
    this._playingScreen.init();
  }

  // Blink "PRESS START" text per INITIAL_SCREEN_BLINK_INTERVAL.
  update(elapsedMs) {
    this._determineHovering();
    this._playingScreen.update(elapsedMs);
    this._blinkPressStart(elapsedMs);
  }

  _determineHovering() {
    let nextNeedle = null;
    app.needleSelection.getNeedles().each(d => {
      if (d.passed) return;
      if (nextNeedle) {
        nextNeedle = nextNeedle.x < d.x ? nextNeedle : d;
      } else {
        nextNeedle = d;
      }
    });
    util.assert(nextNeedle != null);
    let doHover = app.threadDS.cy > nextNeedle.y + app.getMmByLevel(app.ctx.level) / 2;
    // If the thread is near the bottom of screen
    if (app.threadDS.cy >= app.getSvgDS().height - 20) doHover = true;
    app.threadSelection.setHovering(doHover);
  }

  _blinkPressStart(elapsedMs) {
    this._totalElapsedMs += elapsedMs;
    const mod = this._totalElapsedMs % constant.INITIAL_SCREEN_BLINK_INTERVAL;
    if (mod) {
      this._blink = !this._blink;
    }
    this._totalElapsedMs = mod;
  }

  touchStart() {
    app.pressStartSelection.resetPressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
    app.screenDispatcher.changeScreen(constant.SCR_SELECT_MODE);
  }

  touchEnd() { }

  mouseOut() {
    // Ignore: Do not pause on mouseout.
  }
}
