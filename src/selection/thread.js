// Manipulation methods for selection(s) of threads

import {app} from '../app.js'
import * as util from '../util.js'
import * as constant from '../constant.js'

export default class ThreadSelection {
  constructor () {
    const svgDS = app.getSvgDS()
    this._threadDS = [{  // <circle>
      cx: svgDS.width * 0.33, cy: svgDS.height * 0.33,
      fill: 'red', r: 5, a: 1
    }]
    this._hovering = false
  }

  getDS () {
    return this._threadDS[0]
  }

  moveThread (movePercent) {
    const dataset = this._threadDS[0]
    if (!this._hovering) {
      if (dataset.a < app.ctx.maxA) {
        dataset.a += app.ctx.Da * movePercent
      }
    } else {
      if (dataset.a > app.ctx.minA) {
        dataset.a -= app.ctx.Da * movePercent
      }
    }
    dataset.cy += dataset.a * movePercent
    return dataset.cy < app.ctx.svgDS.height + app.ctx.threadGameOverGapY
  }

  getThread () {
    return app.$svg.selectAll('.thread').data(this._threadDS)
  }

  drawThread ($thread) {
    // Enter
    $thread.enter().append('circle.thread')
      .attr({
        'cx': () => 0,
        'cy': () => 0,
        'r': d => d.r,
        'fill': d => d.fill
      })
    // Update
    $thread.transition().duration(util.shouldAnimate() ? constant.MSEC_PER_FRAME : 0)
      .attr('transform', d => {
        return `translate(${d.cx},${d.cy})`
      })
  }

  setHovering (value) {
    this._hovering = !!value
  }
}
