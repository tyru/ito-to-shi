// Manipulation methods for selection(s) of threads

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'
import * as util from '../util.js'
import * as constant from '../constant.js'

export default class ThreadSelection {
  getThread() {
    return app.$svg.selectAll('.thread').data(app.ctx.threadDS);
  }

  moveThread() {
    const dataset = app.ctx.threadDS[0];
    if (!app.ctx.hovering) {
      if (dataset.a < app.ctx.maxA) {
        dataset.a += app.ctx.Da;
      }
    } else {
      if (dataset.a > app.ctx.minA) {
        dataset.a -= app.ctx.Da;
      }
    }
    dataset.cy += dataset.a;
    return dataset.cy < app.ctx.svgDS.height + app.ctx.threadGameOverGapY;
  }

  drawThread($thread) {
    // Enter
    $thread.enter().append('circle.thread')
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', d3.f('r'))
      .attr('fill', d3.f('fill'));
    // Update
    $thread.transition().duration(util.shouldAnimate() ? constant.THIRTY_FPS : 0)
      .attr('transform', function(d) {
        return `translate(${d.cx},${d.cy})`;
      });
  }
}
