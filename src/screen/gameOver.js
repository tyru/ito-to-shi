import {app} from '../app.js'
import * as constant from '../constant.js'

export default class GameOverScreen {
  init() {
    // Draw at hidden point to get bbox width & height.
    app.gameOverSelection.makeHiddenGameOver();
    app.gameOverSelection.drawGameOver(app.gameOverSelection.getGameOver());
    // Move to visible point
    app.gameOverSelection.moveGameOver();
    app.gameOverSelection.drawGameOver(app.gameOverSelection.getGameOver());
  }

  touchStart() {
    app.initContext(app.selectedMode);
    app.gameOverSelection.drawGameOver(app.gameOverSelection.getGameOver());
    app.screenDispatcher.changeScreen(constant.SCR_PLAYING);
  }

  touchEnd() { }
}
