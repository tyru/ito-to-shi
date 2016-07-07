import {app} from '../app.js'
import * as constant from '../constant.js'

export default class InitialScreen {
  constructor() {
    this.blink = true;
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

  update() {
    this.blink = !this.blink;
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
