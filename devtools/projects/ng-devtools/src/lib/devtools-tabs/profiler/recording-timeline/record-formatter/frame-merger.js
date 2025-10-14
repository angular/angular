/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
const mergeProperty = (mergeInProp, value) => {
  if (mergeInProp === undefined) {
    return value;
  }
  if (value === undefined) {
    return mergeInProp;
  }
  return mergeInProp + value;
};
const mergeDirective = (mergeIn, second) => {
  mergeIn.changeDetection = mergeProperty(mergeIn.changeDetection, second.changeDetection);
  Object.keys(mergeIn.lifecycle).forEach((key) => {
    const hook = key;
    mergeIn.lifecycle[hook] = mergeProperty(mergeIn.lifecycle[hook], second.lifecycle[hook]);
  });
};
const mergeDirectives = (mergeIn, second) => {
  for (let i = 0; i < second.length; i++) {
    if (!mergeIn[i]) {
      mergeIn[i] = {
        children: [],
        directives: [],
        type: 'element',
      };
    }
    second[i].directives.forEach((d, idx) => {
      const mergeInDirective = mergeIn[i].directives[idx];
      if (mergeInDirective && mergeInDirective.name === d.name) {
        mergeDirective(mergeInDirective, d);
      } else {
        mergeIn[i].directives.push(d);
      }
    });
    mergeDirectives(mergeIn[i].children, second[i].children);
  }
};
const mergeFrame = (mergeIn, second) => {
  mergeIn.duration += second.duration;
  mergeIn.source = '';
  mergeDirectives(mergeIn.directives, second.directives);
};
export const mergeFrames = (frames) => {
  if (!frames || !frames.length) {
    return null;
  }
  const first = JSON.parse(JSON.stringify(frames[0]));
  for (let i = 1; i < frames.length; i++) {
    mergeFrame(first, frames[i]);
  }
  return first;
};
//# sourceMappingURL=frame-merger.js.map
