import {app} from '../app.js'
import * as constant from '../constant.js'

export default class SelectModeScreen {
  init() {
    app.selectModeScreenSelection.makeSelectModeScreen();
    app.selectModeScreenSelection.drawSelectModeScreen(app.selectModeScreenSelection.getSelectModeScreen());
  }

  touchStart() {
    if (app.selectedMode !== '') {
      app.initContext(app.selectedMode);
      app.selectModeScreenSelection.resetSelectModeScreen(app.selectModeScreenSelection.getSelectModeScreen());
      app.selectModeScreenSelection.drawSelectModeScreen(app.selectModeScreenSelection.getSelectModeScreen());
      app.screenDispatcher.changeScreen(constant.SCR_RUNNING);
    }
  }

  touchEnd() { }
}
