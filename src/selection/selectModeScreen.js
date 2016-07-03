// Manipulation methods for selection(s) of select mode screen

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'

export default class SelectModeScreenSelection {
  getSelectModeScreen() {
    return app.$svg.selectAll('.selectModeScreen').data(app.ctx.selectModeScreenDS);
  }

  makeSelectModeScreen() {
    app.ctx.selectModeScreenDS = [{
      x: 0, y: 0, fill: 'black', width: app.ctx.svgDS.width, height: app.ctx.svgDS.height
    }];
    app.ctx.selectModeButtonRectDS = [
      {x: 40, y: 30, fill: 'green', width: 110, height: 70},
      {x: 180, y: 30, fill: 'blue', width: 110, height: 70},
      {x: 40, y: 130, fill: 'red', width: 110, height: 70},
      {x: 180, y: 130, fill: 'purple', width: 110, height: 70}
    ];
    app.ctx.selectModeButtonTextDS = [
      {x: 60, y: 70, fontSize: '24px', text: 'EASY', fill: 'white'},
      {x: 190, y: 70, fontSize: '24px', text: 'NORMAL', fill: 'white'},
      {x: 60, y: 170, fontSize: '24px', text: 'HARD', fill: 'white'},
      {x: 190, y: 170, fontSize: '24px', text: 'LUNATIC', fill: 'white'}
    ];
  }

  clearSelectModeScreen() {
    app.ctx.selectModeScreenDS = [];
    app.ctx.selectModeButtonRectDS = [];
    app.ctx.selectModeButtonTextDS = [];
  }

  drawSelectModeScreen($selectModeScreen) {
    // Enter
    $selectModeScreen.enter()
      .append('g.selectModeScreen')
      .append('rect')
        .attr('x', function(d) { return 0; })
        .attr('y', function(d) { return 0; })
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'))

    const selectMode = function() {
      const mode = d3.select(this).attr('data-mode');
      if (mode !== '') app.selectedMode = mode;
    };
    $selectModeScreen
      .selectAll('rect.selectModeButtonRectDS')
      .data(app.ctx.selectModeButtonRectDS)
      .enter().append('rect.selectModeButtonRectDS')
        .attr('data-mode', function(_, i) {
          return app.ctx.selectModeButtonTextDS[i].text;
        })
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'))
        .on('touchstart mousedown', selectMode);
    $selectModeScreen
      .selectAll('text.selectModeButtonTextDS.disable-select')
      .data(app.ctx.selectModeButtonTextDS)
      .enter().append('text.selectModeButtonTextDS.disable-select')
        .attr('data-mode', d3.f('text'))
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('font-size', d3.f('fontSize'))
        .text(d3.f('text'))
        .on('touchstart mousedown', selectMode);

    // Exit
    $selectModeScreen.exit().remove();
  }
}
