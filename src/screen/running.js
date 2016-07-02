import * as global from '../global.js'

export default class RunningScreen {
  init() {
    global.levelUpSelection.drawLevelUpText(global.levelUpSelection.getLevelUpText());
    global.threadSelection.drawThread(global.threadSelection.getThread());
    global.needleSelection.makeNeedles();
    global.needleSelection.drawNeedles(global.needleSelection.getNeedles());
    global.statusSelection.drawStatusText(global.statusSelection.getStatusText());
  }

  update() {
    // score -> level -> mm
    function calcLevelByScore(score) {
      if (global.ctx.level + 1 < global.ctx.scoreMmMap.length) {
        if (score >= global.getScoreByLevel(global.ctx.level + 1)) {
          return global.ctx.level + 1;
        }
        return global.ctx.level;
      } else {
        return Math.min(global.ctx.level, global.ctx.scoreMmMap.length - 1);
      }
    }
    // Detect collisions with thread & needles.
    function detectCollision() {
      let doContinue = true;
      const thread = global.ctx.threadDS[0];
      const statusText = global.ctx.statusTextDS[0];
      global.needleSelection.getNeedles().each(function(d) {
        if (d.passed) return;
        const mm = global.getMmByLevel(global.ctx.level);
        const fromY = d.y + global.NEEDLE_HOLE_DY;
        const toY = fromY + mm;
        if (thread.cx >= d.x) {
          if (fromY <= thread.cy - thread.r && thread.cy + thread.r <= toY) { // Passed
            statusText.score++;
            global.ctx.level = calcLevelByScore(statusText.score); // May Lv. Up
            d.passed = true;
          } else {  // Failed
            doContinue = false;
          }
        }
      });
      return doContinue;
    }

    // Move objects
    let doContinue = global.threadSelection.moveThread();
    global.needleSelection.moveNeedles();
    const oldLevel = global.ctx.level;
    doContinue = detectCollision() && doContinue;
    global.levelUpSelection.moveLevelUpText(oldLevel !== global.ctx.level);
    // Update screen
    global.threadSelection.drawThread(global.threadSelection.getThread());
    global.needleSelection.drawNeedles(global.needleSelection.getNeedles());
    global.statusSelection.drawStatusText(global.statusSelection.getStatusText());
    global.levelUpSelection.drawLevelUpText(global.levelUpSelection.getLevelUpText());
    // GAME OVER
    if (!doContinue) {
      global.screenDispatcher.changeScreen(global.SCR_GAMEOVER);
    }
  }

  getInterval() {
    return global.THIRTY_FPS;
  }

  touchStart() {
    global.ctx.hovering = true;
  }

  touchEnd() {
    global.ctx.hovering = false;
  }
}
