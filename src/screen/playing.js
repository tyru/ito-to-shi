import {app} from '../app.js'
import * as constant from '../constant.js'

export default class PlayingScreen {
  init() {
    app.levelUpSelection.drawLevelUpText(app.levelUpSelection.getLevelUpText());
    app.threadSelection.drawThread(app.threadSelection.getThread());
    app.needleSelection.makeNeedles();
    app.needleSelection.drawNeedles(app.needleSelection.getNeedles());
    app.statusSelection.drawStatusText(app.statusSelection.getStatusText());

    // Draw at hidden point to get bbox width & height.
    // * "GAME OVER" text
    app.gameOverSelection.makeHiddenGameOver();
    app.gameOverSelection.drawGameOver(app.gameOverSelection.getGameOver());
    // * "PAUSE" text
    app.pauseSelection.makeHiddenPause();
    app.pauseSelection.drawPause(app.pauseSelection.getPause());

    this._paused = false;
  }

  update(elapsedMs) {
    if (this._paused) {
      return;
    }
    const movePercent = elapsedMs / constant.MSEC_PER_FRAME;
    // Move objects
    let doContinue = app.threadSelection.moveThread(movePercent);
    app.needleSelection.moveNeedles(movePercent);
    const oldLevel = app.ctx.level;
    doContinue = this._detectCollision() && doContinue;
    app.levelUpSelection.moveLevelUpText(oldLevel !== app.ctx.level, movePercent);
    // Update screen
    app.threadSelection.drawThread(app.threadSelection.getThread());
    app.needleSelection.drawNeedles(app.needleSelection.getNeedles());
    app.statusSelection.drawStatusText(app.statusSelection.getStatusText(), elapsedMs);
    app.levelUpSelection.drawLevelUpText(app.levelUpSelection.getLevelUpText());
    // GAME OVER
    if (!doContinue) {
      this.changeToGameOver();
    }
    return doContinue;
  }

  changeToGameOver() {
    app.screenDispatcher.changeScreen(constant.SCR_GAMEOVER);
  }

  // Detect collisions between thread & needles.
  _detectCollision() {
    let doContinue = true;
    app.needleSelection.getNeedles().each(d => {
      if (d.passed) return;
      const mm = app.getMmByLevel(app.ctx.level);
      const fromY = d.y + constant.NEEDLE_HOLE_DY;
      const toY = fromY + mm;
      const thread = app.threadDS;
      if (thread.cx >= d.x) {
        if (fromY <= thread.cy - thread.r && thread.cy + thread.r <= toY) { // Passed
          app.statusTextScore++;
          app.ctx.level = this._calcLevelByScore(app.statusTextScore); // May Lv. Up
          d.passed = true;
        } else {  // Failed
          doContinue = false;
        }
      }
    });
    return doContinue;
  }

  // score -> level -> mm
  _calcLevelByScore(score) {
    if (app.ctx.level + 1 < app.ctx.scoreMmMap.length) {
      if (score >= app.getScoreByLevel(app.ctx.level + 1)) {
        return app.ctx.level + 1;
      }
      return app.ctx.level;
    } else {
      return Math.min(app.ctx.level, app.ctx.scoreMmMap.length - 1);
    }
  }

  touchStart() {
    if (this._paused) {
      app.pauseSelection.makeHiddenPause();
      app.pauseSelection.drawPause(app.pauseSelection.getPause());
      this._paused = false;
    } else {
      app.threadSelection.setHovering(true);
    }
  }

  touchEnd() {
    app.threadSelection.setHovering(false);
  }

  mouseOut() {
    // Move to visible point
    app.pauseSelection.movePause();
    app.pauseSelection.drawPause(app.pauseSelection.getPause());
    this._paused = true;
  }
}
