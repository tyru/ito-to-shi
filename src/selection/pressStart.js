// Manipulation methods for selection(s) of "PRESS START" text

import {app} from '../app.js'

export default class PressStartSelection {
  constructor () {
    this.pressStartDS = []
  }

  resetPressStart () {
    this.pressStartDS = []
  }

  makeHiddenPressStart () {
    this.pressStartDS = [{  // <text>
      x: -99, y: -99, fontSize: '24px', text: 'PRESS START',
      fill: 'black'
    }]
  }

  movePressStart () {
    const dataset = this.pressStartDS[0]
    const bbox = document.getElementById('pressStart').getBBox()
    dataset.x = app.ctx.svgDS.width / 2 - bbox.width / 2
    dataset.y = app.ctx.svgDS.height / 2 - bbox.height / 2
  }

  getPressStart () {
    return app.$svg.selectAll('#pressStart').data(this.pressStartDS)
  }

  drawPressStart ($pressStart) {
    // Enter
    $pressStart.enter().append('text#pressStart.disable-select')
      .attr('font-size', d => d.fontSize)
      .text(d => d.text)

    // Exit
    $pressStart.exit().remove()

    // Update
    $pressStart
      .attr({
        'x': d => d.x,
        'y': d => d.y,
        'fill': d => d.fill
      })
  }
}
