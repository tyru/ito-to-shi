import {app} from '../app.js'
import * as constant from '../constant.js'

export default class SelectModeScreen {
  init () {
    const selection = app.selectModeScreenSelection
    selection.makeSelectModeScreen()
    selection.drawSelectModeScreen(selection.getSelectModeScreen())
  }

  touchStart () {
    const selection = app.selectModeScreenSelection
    selection.resetSelectModeScreen(selection.getSelectModeScreen())
    selection.drawSelectModeScreen(selection.getSelectModeScreen())
    app.initContext(app.selectedMode)
    app.screenDispatcher.changeScreen(constant.SCR_PLAYING)
  }

  touchEnd () { }
}
