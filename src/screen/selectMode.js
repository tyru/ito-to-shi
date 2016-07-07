import {app} from '../app.js'
import * as constant from '../constant.js'

export default class SelectModeScreen {
  init() {
    const selection = app.selectModeScreenSelection;
    selection.makeSelectModeScreen();
    selection.drawSelectModeScreen(selection.getSelectModeScreen());
  }

  touchStart() {
    if (app.selectedMode !== '') {
      app.initContext(app.selectedMode);
      const selection = app.selectModeScreenSelection;
      selection.resetSelectModeScreen(selection.getSelectModeScreen());
      selection.drawSelectModeScreen(selection.getSelectModeScreen());
      app.screenDispatcher.changeScreen(constant.SCR_RUNNING);
    }
  }

  touchEnd() { }
}
