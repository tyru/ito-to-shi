// Manipulation methods for selection(s) of threads

import d3 from 'd3'
import 'd3-jetpack'
import * as global from '../global.js'
import * as util from '../util.js'

export default class ThreadSelection {
  getThread() {
    return global.$svg.selectAll('.thread').data(global.ctx.threadDS);
  }

  moveThread() {
    const dataset = global.ctx.threadDS[0];
    if (!global.ctx.hovering) {
      if (dataset.a < global.ctx.maxA) {
        dataset.a += global.ctx.Da;
      }
    } else {
      if (dataset.a > global.ctx.minA) {
        dataset.a -= global.ctx.Da;
      }
    }
    dataset.cy += dataset.a;
    return dataset.cy < global.ctx.svgDS.height + global.ctx.threadGameOverGapY;
  }

  drawThread($thread) {
    // Enter
    $thread.enter().append('circle.thread')
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', d3.f('r'))
      .attr('fill', d3.f('fill'));
    // Update
    $thread.transition().duration(util.shouldAnimate() ? global.THIRTY_FPS : 0)
      .attr('transform', function(d) {
        return `translate(${d.cx},${d.cy})`;
      });
  }
}
