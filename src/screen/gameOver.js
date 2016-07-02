import * as global from '../global.js'

export default class GameOverScreen {
  init() {
    // Draw at hidden point to get bbox width & height.
    global.ctx.gameOverDS = [{  // <text>
      x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
    }];
    global.gameOverSelection.drawGameOver(global.gameOverSelection.getGameOver());
    // Move to visible point
    global.gameOverSelection.moveGameOver();
    global.gameOverSelection.drawGameOver(global.gameOverSelection.getGameOver());
  }

  touchStart() {
    global.initContext(global.getInitVars(global.selectedMode));
    global.gameOverSelection.drawGameOver(global.gameOverSelection.getGameOver());
    global.screenDispatcher.changeScreen(global.SCR_RUNNING);
  }

  touchEnd() { }
}
