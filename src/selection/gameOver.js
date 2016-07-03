// Manipulation methods for selection(s) of "GAME OVER" text

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class GameOverSelection {
  getGameOver() {
    return app.$svg.selectAll('#gameOver').data(app.ctx.gameOverDS);
  }

  moveGameOver() {
    const dataset = app.ctx.gameOverDS[0];
    const bbox = document.getElementById('gameOver').getBBox();
    dataset.x = app.ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = app.ctx.svgDS.height / 2 - bbox.height / 2;
  }

  drawGameOver($gameover) {
    // Enter
    $gameover.enter().append('text#gameOver.disable-select')
      .attr('font-size', d3.f('fontSize'))
      .text(d3.f('text'));

    // Exit
    $gameover.exit().remove();

    // Update
    $gameover
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
  }
}
