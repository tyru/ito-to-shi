import * as global from '../global.js'

export default class SelectModeScreen {
  init() {
    global.selectModeScreenSelection.makeSelectModeScreen();
    global.selectModeScreenSelection.drawSelectModeScreen(global.selectModeScreenSelection.getSelectModeScreen());
  }

  touchStart() {
    if (global.selectedMode !== '') {
      global.initContext(global.getInitVars(global.selectedMode));
      global.selectModeScreenSelection.clearSelectModeScreen(global.selectModeScreenSelection.getSelectModeScreen());
      global.selectModeScreenSelection.drawSelectModeScreen(global.selectModeScreenSelection.getSelectModeScreen());
      global.screenDispatcher.changeScreen(global.SCR_RUNNING);
    }
  }

  touchEnd() { }
}
