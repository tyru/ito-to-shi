// Manipulation methods for selection(s) of status

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class StatusSelection {
  getStatusText() {
    return app.$svg.selectAll('#statusText').data(app.ctx.statusTextDS);
  }

  drawStatusText($statusText) {
    // Enter
    $statusText.enter().append('text#statusText.disable-select')
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('font-size', d3.f('fontSize'));
    // Update
    const mm = app.getMmByLevel(app.ctx.level);
    const distanceX = app.getDistanceXByLevel(app.ctx.level);
    $statusText
      .text(function(d) { return `${d.mode} ${d.score}本 針穴${mm}mm 距離${distanceX}m`; });
  }
}
