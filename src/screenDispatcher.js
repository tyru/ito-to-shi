// * Dispatches *Screen instances' methods.
// * Changes current screen ID.

import d3 from 'd3'
import 'd3-jetpack'
import * as global from './global.js'

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
    if (global.ctx.theTimer) {
      clearInterval(global.ctx.theTimer);
      global.ctx.theTimer = null;
    }
    const screen = this.screens[id];
    if (!screen) {
      return;
    }
    // Call init functions
    if (screen.init) {
      global.ctx.animateGlobal = false;
      screen.init();
      global.ctx.animateGlobal = true;
    }
    // Update draw function
    if (screen.update && screen.getInterval) {
      global.ctx.theTimer = setInterval(screen.update, screen.getInterval());
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
