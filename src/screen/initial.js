import {app} from '../app.js'
import * as constant from '../constant.js'
import * as util from '../util.js'
import PlayingScreen from './playing.js'

export default class InitialScreen {
  constructor() {
    this._playingScreen = new PlayingScreen();
    this._playingScreen.changeToGameOver = function changeToGameOver() {
      app.initContext(app.selectedMode);
      app.screenDispatcher.changeScreen(constant.SCR_INITIAL);
    };
  }

  init() {
    this._playingScreen.init();
    // Make demo play's opacity layer
    app.initialTransparentRect.makeInitialTransparentRect();
    app.initialTransparentRect.drawInitialTransparentRect(
      app.initialTransparentRect.getInitialTransparentRect()
    );
    // Draw at hidden point to get bbox width & height
    app.pressStartSelection.makeHiddenPressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
    // Move to visible point
    app.pressStartSelection.movePressStart();
    app.pressStartSelection.drawPressStart(app.pressStartSelection.getPressStart());
  }

  // Blink "PRESS START" text per INITIAL_SCREEN_BLINK_INTERVAL.
  update(elapsedMs) {
    this._determineHovering();
    this._playingScreen.update(elapsedMs);
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

  touchStart() {
    app.pressStartSelection.resetPressStart();
    app.pressStartSelection.drawPressStart(
      app.pressStartSelection.getPressStart()
    );
    app.initialTransparentRect.resetInitialTransparentRect();
    app.initialTransparentRect.drawInitialTransparentRect(
      app.initialTransparentRect.getInitialTransparentRect()
    );
    app.screenDispatcher.changeScreen(constant.SCR_SELECT_MODE);
  }

  touchEnd() { }

  mouseOut() {
    // Ignore: Do not pause on mouseout.
  }
}
