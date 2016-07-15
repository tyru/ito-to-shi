// Manipulation methods for selection(s) of "GAME OVER" text

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class GameOverSelection {
  constructor() {
    this.makeHiddenGameOver();
  }

  makeHiddenGameOver() {
    this.gameOverDS = [{  // <text>
      x: -99, y: -99, fontSize: '24px', text: 'GAME OVER'
    }];
  }

  moveGameOver() {
    const dataset = this.gameOverDS[0];
    const bbox = document.getElementById('gameOver').getBBox();
    dataset.x = app.ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = app.ctx.svgDS.height / 2 - bbox.height / 2;
  }

  getGameOver() {
    return app.$svg.selectAll('#gameOver').data(this.gameOverDS);
  }

  drawGameOver($gameover) {
    // Enter
    $gameover.enter().append('text#gameOver.disable-select')
      .attr('font-size', d => d.fontSize)
      .text(d => d.text);

    // Exit
    $gameover.exit().remove();

    // Update
    $gameover.attr({'x': d => d.x, 'y': d => d.y})
  }
}
