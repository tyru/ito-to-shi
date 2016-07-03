import {app} from './app.js'

export function randNumBetween(start, end) {
  return Math.random() * (end - start) + start;
};

export function cloneObject(obj) {
  if (typeof obj !== 'object') return obj;
  let newObj = {}, key;
  for (key in obj) {
    newObj[key] = cloneObject(obj[key]);
  }
  return newObj;
};

export function assert(cond, msg) {
  if (!cond) {
    throw new Error('Assertion Error' + (msg ? ': ' + msg : ''));
  }
};

export function shouldAnimate(dataset) {
  if (dataset && !dataset.animate)
    return false;
  return app.ctx.animateGlobal;
};
