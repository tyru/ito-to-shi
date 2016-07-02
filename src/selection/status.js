// Manipulation methods for selection(s) of status

import d3 from 'd3'
import 'd3-jetpack'
import * as global from '../global.js'

export default class StatusSelection {
  getStatusText() {
    return global.$svg.selectAll('#statusText').data(global.ctx.statusTextDS);
  }

  drawStatusText($statusText) {
    // Enter
    $statusText.enter().append('text#statusText.disable-select')
      .attr('x', d3.f('x'))
      .attr('y', d3.f('y'))
      .attr('font-size', d3.f('fontSize'));
    // Update
    const mm = global.getMmByLevel(global.ctx.level);
    const distanceX = global.getDistanceXByLevel(global.ctx.level);
    $statusText
      .text(function(d) { return `${d.mode} ${d.score}本 針穴${mm}mm 距離${distanceX}m`; });
  }
}
