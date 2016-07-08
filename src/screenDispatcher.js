// * Dispatches *Screen instances' methods.
// * Changes current screen ID.

import d3 from 'd3'
import 'd3-jetpack'
import {app} from './app.js'

export default class ScreenDispatcher {
  constructor(id) {
    this.screens = {};
    this.screenId = id;
  }

  setScreenId(id) {
    this.screenId = id;
  }

  register(id, func) {
    this.screens[id] = func;
  }

  changeScreen(id) {
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
    this.screenId = id;
  }

  touchStart() {
    d3.event.preventDefault();    // Don't propagate click event to outside <svg> tag
    this.screens[this.screenId].touchStart(...arguments);
  }

  touchEnd() {
    this.screens[this.screenId].touchEnd(...arguments);
  }
}
