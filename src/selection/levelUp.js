// Manipulation methods for selection(s) of needles

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class LevelUpSelection {
  constructor() {
    this.levelUpDS = [{  // <text>
      x: -99, y: -99, fontSize: '18px', text: 'Lv. UP', fill: 'red',
      dy: -1, hoverHeight: 20
    }];
  }

  moveLevelUpText(show, movePercent) {
    const dataset = this.levelUpDS[0];
    if (show) { // Start
      dataset.x = app.threadDS.cx;
      dataset.y = app.threadDS.cy;
      dataset.endY = dataset.y - dataset.hoverHeight;
    } else if (dataset.y >= dataset.endY) { // Hovering
      dataset.y += dataset.dy * movePercent;
    } else if (dataset.endY) { // End
      dataset.x = dataset.y = -99;
      delete dataset.endY;
    }
  }

  getLevelUpText() {
    return app.$svg.selectAll('#levelUp').data(this.levelUpDS);
  }

  drawLevelUpText($pressStart) {
    // Enter
    $pressStart.enter().append('text#levelUp.disable-select')
      .attr({
        'style': 'font-weight: bold;',
        'font-size': d => d.fontSize
      })
      .text(d => d.text);

    // Exit
    $pressStart.exit().remove();

    // Update
    $pressStart
      .attr({
        'x': d => d.x,
        'y': d => d.y,
        'fill': d => d.fill
      })
  }
}
