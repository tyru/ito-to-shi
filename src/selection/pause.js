// Manipulation methods for selection(s) of "PAUSE" text

import {app} from '../app.js'

export default class PauseSelection {
  constructor () {
    this.makeHiddenPause()
  }

  makeHiddenPause () {
    this.pauseDS = [{  // <text>
      x: -99, y: -99, fontSize: '24px', text: 'PAUSE'
    }]
  }

  movePause () {
    const dataset = this.pauseDS[0]
    const bbox = document.getElementById('pause').getBBox()
    dataset.x = app.ctx.svgDS.width / 2 - bbox.width / 2
    dataset.y = app.ctx.svgDS.height / 2 - bbox.height / 2
  }

  getPause () {
    return app.$svg.selectAll('#pause').data(this.pauseDS)
  }

  drawPause ($pause) {
    // Enter
    $pause.enter().append('text#pause.disable-select')
      .attr('font-size', d => d.fontSize)
      .text(d => d.text)

    // Exit
    $pause.exit().remove()

    // Update
    $pause.attr({'x': d => d.x, 'y': d => d.y})
  }
}
