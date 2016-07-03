// Manipulation methods for selection(s) of "PRESS START" text

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class PressStartSelection {
  getPressStart() {
    return app.$svg.selectAll('#pressStart').data(app.ctx.pressStartDS);
  }

  movePressStart() {
    const dataset = app.ctx.pressStartDS[0];
    const bbox = document.getElementById('pressStart').getBBox();
    dataset.x = app.ctx.svgDS.width / 2 - bbox.width / 2;
    dataset.y = app.ctx.svgDS.height / 2 - bbox.height / 2;
  }

  drawPressStart($pressStart) {
    // Enter
    $pressStart.enter().append('text#pressStart.disable-select')
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
