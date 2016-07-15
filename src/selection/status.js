// Manipulation methods for selection(s) of status

import {app} from '../app.js'
import * as constant from '../constant.js'

export default class StatusSelection {
  constructor (mode) {
    this._statusTextDS = [{  // <text>
      x: 60, y: 12, fontSize: '12px', text: '',
      score: 0, mode: mode
    }]
    this._totalElapsedMs = 0
    this._fpsFmt = '60.0'
  }

  getScore () { return this._statusTextDS[0].score }
  setScore (v) { this._statusTextDS[0].score = v }

  setMode (mode) { this._statusTextDS[0].mode = mode }

  getStatusText () {
    return app.$svg.selectAll('#statusText').data(this._statusTextDS)
  }

  drawStatusText ($statusText, elapsedMs = 0) {
    // Enter
    $statusText.enter().append('text#statusText.disable-select')
      .attr({
        'x': d => d.x,
        'y': d => d.y,
        'font-size': d => d.fontSize
      })
    // Update
    const mm = app.getMmByLevel(app.ctx.level)
    const distanceX = app.getDistanceXByLevel(app.ctx.level)
    this._totalElapsedMs += elapsedMs
    const interval = constant.UPDATE_FPS_TEXT_INTERVAL
    if (this._totalElapsedMs > interval) {
      // Update FPS display
      this._totalElapsedMs = this._totalElapsedMs % interval
      const fps = 1000.0 / elapsedMs
      this._fpsFmt = Math.floor(fps) + '.' + (Math.floor(fps * 10) % 10)
    }
    $statusText
      .text(d => {
        return `${d.mode} ${d.score}本 針穴${mm}mm 距離${distanceX}m ${this._fpsFmt}FPS`
      })
  }
}
