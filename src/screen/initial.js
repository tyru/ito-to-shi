import {app} from '../app.js'
import * as constant from '../constant.js'

export default class InitialScreen {
  constructor() {
    this._blink = true;
    this._totalElapsedMs = 0;
  }

  init() {
    app.threadSelection.drawThread(app.threadSelection.getThread());
    app.needleSelection.makeNeedles();
    app.needleSelection.drawNeedles(app.needleSelection.getNeedles());
    app.statusSelection.drawStatusText(app.statusSelection.getStatusText());

    // Draw at hidden point to get bbox width & height.
    app.pressStartSelection.makeHiddenPressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
    // Move to visible point
    app.pressStartSelection.movePressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
  }

  // Blink "PRESS START" text per INITIAL_SCREEN_BLINK_INTERVAL.
  update(elapsedMs) {
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
}
