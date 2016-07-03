// Manipulation methods for selection(s) of status

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class StatusSelection {
  constructor(mode) {
    this._statusTextDS = [{  // <text>
      x: 60, y: 12, fontSize: '12px', text: '',
      score: 0, mode: mode
    }];
  }

  getScore() { return this._statusTextDS[0].score; }
  setScore(v) { this._statusTextDS[0].score = v; }

  setMode(mode) { this._statusTextDS[0].mode = mode; }

  getStatusText() {
    return app.$svg.selectAll('#statusText').data(this._statusTextDS);
  }

  drawStatusText($statusText) {
    // Enter
    $statusText.enter().append('text#statusText.disable-select')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('font-size', d => d.fontSize);
    // Update
    const mm = app.getMmByLevel(app.ctx.level);
    const distanceX = app.getDistanceXByLevel(app.ctx.level);
    $statusText
      .text(function(d) { return `${d.mode} ${d.score}本 針穴${mm}mm 距離${distanceX}m`; });
  }
}
