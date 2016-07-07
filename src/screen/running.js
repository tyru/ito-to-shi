import {app} from '../app.js'
import * as constant from '../constant.js'

export default class RunningScreen {
  init() {
    app.levelUpSelection.drawLevelUpText(app.levelUpSelection.getLevelUpText());
    app.threadSelection.drawThread(app.threadSelection.getThread());
    app.needleSelection.makeNeedles();
    app.needleSelection.drawNeedles(app.needleSelection.getNeedles());
    app.statusSelection.drawStatusText(app.statusSelection.getStatusText());
  }

  update(elapsedMs) {
    const movePercent = elapsedMs / constant.THE_FPS;
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
      app.screenDispatcher.changeScreen(constant.SCR_GAMEOVER);
    }
    return doContinue;
  }

  // Detect collisions with thread & needles.
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

  getInterval() {
    return constant.THE_FPS;
  }

  touchStart() {
    app.ctx.hovering = true;
  }

  touchEnd() {
    app.ctx.hovering = false;
  }
}
