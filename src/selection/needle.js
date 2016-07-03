// Manipulation methods for selection(s) of needles

import d3 from 'd3'
import 'd3-jetpack'
import {app} from '../app.js'
import * as util from '../util.js'
import * as constant from '../constant.js'

export default class NeedleSelection {
  constructor() {
    this.needlePoleDS = [];    // <rect>
    this.needleHoleDS = [];    // <rect>
  }

  makeNeedles() {
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    const needleNum = Math.floor(app.ctx.svgDS.width / app.ctx.scoreMmMap[0][2] + 2);
    // First object is placed at 'app.ctx.svgDS.width'.
    let objX = app.ctx.svgDS.width;
    for (let i = 0; i < needleNum; i++) {
      app.ctx.needleGroupDS.push({
        x: objX,
        y: util.randNumBetween(0, app.ctx.svgDS.height - app.ctx.scoreMmMap[0][1]),
        passed: false
      });
      this.needlePoleDS.push(util.cloneObject(app.ctx.needlePoleDSTemplate));
      this.needleHoleDS.push(util.cloneObject(app.ctx.needleHoleDSTemplate));
      objX += app.ctx.scoreMmMap[0][2];
    }
  }

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in screen...)
  getNeedles() {
    return app.$svg.selectAll('g.needle').data(app.ctx.needleGroupDS);
  }

  moveNeedles() {
    function getCurrentScore() {
      return app.ctx.statusTextDS[0].score;
    }

    let willMove = -1;
    let maxRightX = -1;
    let rightsideNeedleNum = 0;
    const thread = app.ctx.threadDS[0];
    app.ctx.needleGroupDS = app.ctx.needleGroupDS.map(function(d, i) {
      if (d.x + app.ctx.needleDx < app.ctx.needleGapX) {
        // Next d.x is left of visible screen.
        util.assert(willMove === -1, '0 <= moving needles <= 1');
        willMove = i;
      } else {
        d.x += app.ctx.needleDx;
        d.animate = true;
      }
      if (d.x > thread.cx) rightsideNeedleNum++;
      maxRightX = Math.max(maxRightX, d.x);
      return d;
    });
    if (willMove >= 0) {
      // Move a needle to rightmost at screen.
      // Determine if I must calculate the distanceX by next level or current level.
      const nextLvScore = app.getScoreByLevel(app.ctx.level + 1);
      const level = getCurrentScore() + rightsideNeedleNum >= nextLvScore ?
                    app.ctx.level + 1 : app.ctx.level;
      const distanceX = app.getDistanceXByLevel(level);
      const mm = app.getMmByLevel(level);
      // Move the needle to the right.
      const needleGroupDS = app.ctx.needleGroupDS[willMove];
      needleGroupDS.x = maxRightX + distanceX;
      needleGroupDS.y = util.randNumBetween(0, app.ctx.svgDS.height - mm);
      needleGroupDS.animate = false;
      needleGroupDS.passed = false;
      if (level > app.ctx.level) {
        // Change next level needle's height.
        const needlePoleDS = this.needlePoleDS[willMove];
        needlePoleDS.height = mm;
        // Add a new needle if necessary.
        const nextNeedleNum = Math.floor(app.ctx.svgDS.width / app.getDistanceXByLevel(app.ctx.level + 1) + 2);
        util.assert(nextNeedleNum >= app.ctx.needleGroupDS.length,
              'Lv.UP must not cause app.getMmByLevel() to be smaller number');
        if (nextNeedleNum > app.ctx.needleGroupDS.length) {
          // Re-calculate the necessary number of needles.
          const necessaryNeedleNum = nextNeedleNum - app.ctx.needleGroupDS.length;
          let objX = needleGroupDS.x + distanceX;
          for (let i = 0; i < necessaryNeedleNum; i++) {
            app.ctx.needleGroupDS.push({
              x: objX,
              y: util.randNumBetween(0, app.ctx.svgDS.height - mm),
              passed: false
            });
            this.needlePoleDS.push(util.cloneObject(app.ctx.needlePoleDSTemplate));
            this.needleHoleDS.push(util.cloneObject(app.ctx.needleHoleDSTemplate));
            objX += distanceX;
          }
        }
      }
    }
  }

  drawNeedles($needles) {
    // Enter
    $needles.enter().append('g.needle');
    const $needlePoles = $needles.selectAll('g.needle rect.pole').data(this.needlePoleDS);
    $needlePoles
      .enter().append('rect.pole')
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'));
    const $needleHoles = $needles.selectAll('g.needle rect.hole').data(this.needleHoleDS);
    $needleHoles
      .enter().append('rect.hole')
        .attr('x', d3.f('x'))
        .attr('y', d3.f('y'))
        .attr('fill', d3.f('fill'))
        .attr('width', d3.f('width'))
        .attr('height', d3.f('height'));

    // Update
    // Move with animation.
    $needles.each(function(d) {
      // http://stackoverflow.com/questions/26903355/how-to-cancel-scheduled-transition-in-d3
        d3.select(this)
          .transition().duration(util.shouldAnimate(d) ? constant.THIRTY_FPS : 0)
          .attr('transform', `translate(${d.x},${d.y})`);
    });
    $needleHoles.attr('height', d3.f('height'));

    // Exit
    $needles.exit().remove();
  }
}
