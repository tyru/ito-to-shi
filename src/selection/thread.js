// Manipulation methods for selection(s) of threads

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'
import * as util from '../util.js'
import * as constant from '../constant.js'

export default class ThreadSelection {
  constructor() {
    const svgDS = app.getSvgDS();
    this._threadDS = [{  // <circle>
      cx: svgDS.width * 0.33, cy: svgDS.height * 0.33,
      fill: 'red', r: 5, a: 1
    }];
  }

  getDS() {
    return this._threadDS[0];
  }

  moveThread() {
    const dataset = this._threadDS[0];
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

  getThread() {
    return app.$svg.selectAll('.thread').data(this._threadDS);
  }

  drawThread($thread) {
    // Enter
    $thread.enter().append('circle.thread')
      .attr('cx', function(d) { return 0; })
      .attr('cy', function(d) { return 0; })
      .attr('r', d => d.r)
      .attr('fill', d => d.fill);
    // Update
    $thread.transition().duration(util.shouldAnimate() ? constant.THIRTY_FPS : 0)
      .attr('transform', function(d) {
        return `translate(${d.cx},${d.cy})`;
      });
  }
}
