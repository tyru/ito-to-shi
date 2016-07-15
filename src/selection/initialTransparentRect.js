// Manipulation methods for selection(s) of select mode screen

import {app} from '../app.js'

export default class InitialTransparentRect {
  constructor () {
    this.initialTransparentRect = []
  }

  makeInitialTransparentRect () {
    this.initialTransparentRect = [{    // <g>
      x: 0, y: 0, fill: 'white', fillOpacity: '0.5',
      width: app.ctx.svgDS.width, height: app.ctx.svgDS.height
    }]
  }

  resetInitialTransparentRect () {
    this.initialTransparentRect = []
  }

  getInitialTransparentRect () {
    return app.$svg.selectAll('.initialTransparentRect')
                   .data(this.initialTransparentRect)
  }

  drawInitialTransparentRect ($initialTransparentRect) {
    // Enter
    $initialTransparentRect.enter()
      .append('rect.initialTransparentRect')
        .attr({
          'x': d => d.x,
          'y': d => d.y,
          'fill': d => d.fill,
          'fill-opacity': d => d.fillOpacity,
          'width': d => d.width,
          'height': d => d.height
        })

    // Exit
    $initialTransparentRect.exit().remove()
  }
}
