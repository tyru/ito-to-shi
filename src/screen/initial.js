import * as global from '../global.js'

export default class InitialScreen {
  constructor() {
    this.blink = true;
  }

  init() {
    global.threadSelection.drawThread(global.threadSelection.getThread());
    global.needleSelection.makeNeedles();
    global.needleSelection.drawNeedles(global.needleSelection.getNeedles());
    global.statusSelection.drawStatusText(global.statusSelection.getStatusText());

    // Draw at hidden point to get bbox width & height.
    global.ctx.pressStartDS = [{  // <text>
      x: -99, y: -99, fontSize: '24px', text: 'PRESS START',
      fill: 'black'
    }];
    global.pressStartSelection.drawPressStart(global.pressStartSelection.getPressStart());
    // Move to visible point
    global.pressStartSelection.movePressStart();
    global.pressStartSelection.drawPressStart(global.pressStartSelection.getPressStart());
  }

  update() {
    this.blink = !this.blink;
  }

  getInterval() {
    return 500;
  }

  touchStart() {
    global.ctx.pressStartDS = [];
    global.pressStartSelection.drawPressStart(global.pressStartSelection.getPressStart());
    global.screenDispatcher.changeScreen(global.SCR_SELECT_MODE);
  }

  touchEnd() { }
}
