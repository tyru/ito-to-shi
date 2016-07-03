// * Dispatches *Screen instances' methods.
// * Changes current screen ID.

import d3 from 'd3'
import 'd3-jetpack'
import {app} from './app.js'

export default class ScreenDispatcher {
  constructor(screenId) {
    this.screens = {};
    this.currentScreenId = screenId;
  }

  register(id, func) {
    this.screens[id] = func;
  }

  changeScreen(id) {
    // Clear timer
    if (app.ctx.theTimer) {
      clearInterval(app.ctx.theTimer);
      app.ctx.theTimer = null;
    }
    const screen = this.screens[id];
    if (!screen) {
      return;
    }
    // Call init functions
    if (screen.init) {
      app.ctx.animateGlobal = false;
      screen.init();
      app.ctx.animateGlobal = true;
    }
    // Update draw function
    if (screen.update && screen.getInterval) {
      app.ctx.theTimer = setInterval(screen.update, screen.getInterval());
    }
    this.currentScreenId = id;
  }

  touchStart() {
    d3.event.preventDefault();    // Don't propagate click event to outside <svg> tag
    this.screens[this.currentScreenId].touchStart(...arguments);
  }

  touchEnd() {
    this.screens[this.currentScreenId].touchEnd(...arguments);
  }
}
