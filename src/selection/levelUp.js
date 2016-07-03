// Manipulation methods for selection(s) of needles

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class LevelUpSelection {
  getLevelUpText() {
    return app.$svg.selectAll('#levelUp').data(app.ctx.levelUpDS);
  }

  moveLevelUpText(show) {
    const dataset = app.ctx.levelUpDS[0];
    if (show) { // Start
      dataset.x = app.ctx.threadDS[0].cx;
      dataset.y = app.ctx.threadDS[0].cy;
      dataset.endY = dataset.y - dataset.hoverHeight;
    } else if (dataset.y >= dataset.endY) { // Hovering
      dataset.y += dataset.dy;
    } else if (dataset.endY) { // End
      dataset.x = dataset.y = -99;
      delete dataset.endY;
    }
  }

  drawLevelUpText($pressStart) {
    // Enter
    $pressStart.enter().append('text#levelUp.disable-select')
      .attr('style', 'font-weight: bold;')
      .attr('font-size', d3.f('fontSize'))
      .text(d3.f('text'));

    // Exit
    $pressStart.exit().remove();

    // Update
    $pressStart
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('fill', d3.f('fill'))
  }
}
