// Manipulation methods for selection(s) of needles

import d3 from 'd3'
import 'd3-jetpack'
import * as global from '../global.js'
import * as util from '../util.js'

export default class NeedleSelection {
  constructor() {
    this.needlePoleDS = [];    // <rect>
    this.needleHoleDS = [];    // <rect>
  }

  makeNeedles() {
    // To place the next needle when hole height (mm) is changed,
    // We must have enough number of needles on screen (even if invisible).
    const needleNum = Math.floor(global.ctx.svgDS.width / global.ctx.scoreMmMap[0][2] + 2);
    // First object is placed at 'global.ctx.svgDS.width'.
    let objX = global.ctx.svgDS.width;
    for (let i = 0; i < needleNum; i++) {
      global.ctx.needleGroupDS.push({
        x: objX,
        y: util.randNumBetween(0, global.ctx.svgDS.height - global.ctx.scoreMmMap[0][1]),
        passed: false
      });
      this.needlePoleDS.push(util.cloneObject(global.ctx.needlePoleDSTemplate));
      this.needleHoleDS.push(util.cloneObject(global.ctx.needleHoleDSTemplate));
      objX += global.ctx.scoreMmMap[0][2];
    }
  }

  // Need to access to moving objects via D3 API.
  // (Saving to '$needles' variable leaves old objects in screen...)
  getNeedles() {
    return global.$svg.selectAll('g.needle').data(global.ctx.needleGroupDS);
  }

  moveNeedles() {
    function getCurrentScore() {
      return global.ctx.statusTextDS[0].score;
    }

    let willMove = -1;
    let maxRightX = -1;
    let rightsideNeedleNum = 0;
    const thread = global.ctx.threadDS[0];
    global.ctx.needleGroupDS = global.ctx.needleGroupDS.map(function(d, i) {
      if (d.x + global.ctx.needleDx < global.ctx.needleGapX) {
        // Next d.x is left of visible screen.
        util.assert(willMove === -1, '0 <= moving needles <= 1');
        willMove = i;
      } else {
        d.x += global.ctx.needleDx;
        d.animate = true;
      }
      if (d.x > thread.cx) rightsideNeedleNum++;
      maxRightX = Math.max(maxRightX, d.x);
      return d;
    });
    if (willMove >= 0) {
      // Move a needle to rightmost at screen.
      // Determine if I must calculate the distanceX by next level or current level.
      const nextLvScore = global.getScoreByLevel(global.ctx.level + 1);
      const level = getCurrentScore() + rightsideNeedleNum >= nextLvScore ?
                    global.ctx.level + 1 : global.ctx.level;
      const distanceX = global.getDistanceXByLevel(level);
      const mm = global.getMmByLevel(level);
      // Move the needle to the right.
      const needleGroupDS = global.ctx.needleGroupDS[willMove];
      needleGroupDS.x = maxRightX + distanceX;
      needleGroupDS.y = util.randNumBetween(0, global.ctx.svgDS.height - mm);
      needleGroupDS.animate = false;
      needleGroupDS.passed = false;
      if (level > global.ctx.level) {
        // Change next level needle's height.
        const needlePoleDS = this.needlePoleDS[willMove];
        needlePoleDS.height = mm;
        // Add a new needle if necessary.
        const nextNeedleNum = Math.floor(global.ctx.svgDS.width / global.getDistanceXByLevel(global.ctx.level + 1) + 2);
        util.assert(nextNeedleNum >= global.ctx.needleGroupDS.length,
              'Lv.UP must not cause global.getMmByLevel() to be smaller number');
        if (nextNeedleNum > global.ctx.needleGroupDS.length) {
          // Re-calculate the necessary number of needles.
          const necessaryNeedleNum = nextNeedleNum - global.ctx.needleGroupDS.length;
          let objX = needleGroupDS.x + distanceX;
          for (let i = 0; i < necessaryNeedleNum; i++) {
            global.ctx.needleGroupDS.push({
              x: objX,
              y: util.randNumBetween(0, global.ctx.svgDS.height - mm),
              passed: false
            });
            this.needlePoleDS.push(util.cloneObject(global.ctx.needlePoleDSTemplate));
            this.needleHoleDS.push(util.cloneObject(global.ctx.needleHoleDSTemplate));
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
          .transition().duration(util.shouldAnimate(d) ? global.THIRTY_FPS : 0)
          .attr('transform', `translate(${d.x},${d.y})`);
    });
    $needleHoles.attr('height', d3.f('height'));

    // Exit
    $needles.exit().remove();
  }
}
