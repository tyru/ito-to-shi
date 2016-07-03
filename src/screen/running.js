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

  update() {
    // score -> level -> mm
    function calcLevelByScore(score) {
      if (app.ctx.level + 1 < app.ctx.scoreMmMap.length) {
        if (score >= app.getScoreByLevel(app.ctx.level + 1)) {
          return app.ctx.level + 1;
        }
        return app.ctx.level;
      } else {
        return Math.min(app.ctx.level, app.ctx.scoreMmMap.length - 1);
      }
    }
    // Detect collisions with thread & needles.
    function detectCollision() {
      let doContinue = true;
      const thread = app.ctx.threadDS[0];
      const statusText = app.ctx.statusTextDS[0];
      app.needleSelection.getNeedles().each(function(d) {
        if (d.passed) return;
        const mm = app.getMmByLevel(app.ctx.level);
        const fromY = d.y + constant.NEEDLE_HOLE_DY;
        const toY = fromY + mm;
        if (thread.cx >= d.x) {
          if (fromY <= thread.cy - thread.r && thread.cy + thread.r <= toY) { // Passed
            statusText.score++;
            app.ctx.level = calcLevelByScore(statusText.score); // May Lv. Up
            d.passed = true;
          } else {  // Failed
            doContinue = false;
          }
        }
      });
      return doContinue;
    }

    // Move objects
    let doContinue = app.threadSelection.moveThread();
    app.needleSelection.moveNeedles();
    const oldLevel = app.ctx.level;
    doContinue = detectCollision() && doContinue;
    app.levelUpSelection.moveLevelUpText(oldLevel !== app.ctx.level);
    // Update screen
    app.threadSelection.drawThread(app.threadSelection.getThread());
    app.needleSelection.drawNeedles(app.needleSelection.getNeedles());
    app.statusSelection.drawStatusText(app.statusSelection.getStatusText());
    app.levelUpSelection.drawLevelUpText(app.levelUpSelection.getLevelUpText());
    // GAME OVER
    if (!doContinue) {
      app.screenDispatcher.changeScreen(constant.SCR_GAMEOVER);
    }
  }

  getInterval() {
    return constant.THIRTY_FPS;
  }

  touchStart() {
    app.ctx.hovering = true;
  }

  touchEnd() {
    app.ctx.hovering = false;
  }
}
