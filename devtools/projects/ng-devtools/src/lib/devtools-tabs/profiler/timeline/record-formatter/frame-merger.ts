/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DirectiveProfile,
  ElementProfile,
  LifecycleProfile,
  ProfilerFrame,
} from '../../../../../../../protocol';

const mergeProperty = (mergeInProp: number | undefined, value: number | undefined) => {
  if (mergeInProp === undefined) {
    return value;
  }
  if (value === undefined) {
    return mergeInProp;
  }
  return mergeInProp + value;
};

const mergeDirective = (mergeIn: DirectiveProfile, second: DirectiveProfile) => {
  mergeIn.changeDetection = mergeProperty(mergeIn.changeDetection, second.changeDetection);
  Object.keys(mergeIn.lifecycle).forEach((key) => {
    const hook = key as keyof LifecycleProfile;
    mergeIn.lifecycle[hook] = mergeProperty(mergeIn.lifecycle[hook], second.lifecycle[hook]);
  });
};

const mergeDirectives = (mergeIn: ElementProfile[], second: ElementProfile[]) => {
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

const mergeFrame = (mergeIn: ProfilerFrame, second: ProfilerFrame) => {
  mergeIn.duration += second.duration;
  mergeIn.source = '';
  mergeDirectives(mergeIn.directives, second.directives);
};

export const mergeFrames = (frames: ProfilerFrame[]): ProfilerFrame | null => {
  if (!frames || !frames.length) {
    return null;
  }
  const first = JSON.parse(JSON.stringify(frames[0])) as ProfilerFrame;
  for (let i = 1; i < frames.length; i++) {
    mergeFrame(first, frames[i]);
  }
  return first;
};
