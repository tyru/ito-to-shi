import {app} from '../app.js'
import * as constant from '../constant.js'

export default class InitialScreen {
  constructor() {
    this._blink = true;
    this._prevUpdated = 0;
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

  // Update per 1 second.
  update(elapsedMs) {
    this._prevUpdated += elapsedMs;
    const mod = this._prevUpdated % 1000;
    if (mod) {
      this._blink = !this._blink;
    }
    this._prevUpdated = mod;
  }

  getInterval() {
    return 500;
  }

  touchStart() {
    app.pressStartSelection.resetPressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
    app.screenDispatcher.changeScreen(constant.SCR_SELECT_MODE);
  }

  touchEnd() { }
}
