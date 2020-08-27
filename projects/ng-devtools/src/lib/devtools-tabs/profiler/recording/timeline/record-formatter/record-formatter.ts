import { ElementProfile, DirectiveProfile, ProfilerFrame, ElementPosition } from 'protocol';

export interface TimelineView<T> {
  timeline: AppEntry<T>[];
}

export interface AppEntry<T> {
  app: T[];
  timeSpent: number;
  source: string;
}

export interface GraphNode {
  toolTip: string;
  style: any;
}

export abstract class RecordFormatter<T> {
  abstract formatFrame(frame: ProfilerFrame): T;
  abstract addFrame(nodes: T | T[], elements: ElementProfile[]): number | void;

  getLabel(element: ElementProfile): string {
    const name = element.directives
      .filter((d) => d.isComponent)
      .map((c) => c.name)
      .join(', ');
    const attributes = [...new Set(element.directives.filter((d) => !d.isComponent).map((d) => d.name))].join(', ');
    return attributes === '' ? name : `${name}[${attributes}]`;
  }

  getValue(element: ElementProfile): number {
    let result = 0;
    element.directives.forEach((dir) => {
      result += this.getDirectiveValue(dir);
    });
    return result;
  }

  getDirectiveValue(directive: DirectiveProfile): number {
    let result = 0;
    let current = directive.changeDetection;
    if (current === undefined) {
      current = 0;
    }
    result += current;
    Object.keys(directive.lifecycle).forEach((key) => {
      const value = parseFloat(directive.lifecycle[key]);
      if (!isNaN(value)) {
        result += value;
      }
    });
    return result;
  }
}

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
  Object.keys(mergeIn.lifecycle).forEach((hook) => {
    mergeIn.lifecycle[hook] = mergeProperty(mergeIn.lifecycle[hook], second.lifecycle[hook]);
  });
};

const mergeDirectives = (mergeIn: ElementProfile[], second: ElementProfile[]) => {
  for (let i = 0; i < second.length; i++) {
    if (!mergeIn[i]) {
      mergeIn[i] = {
        children: [],
        directives: [],
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
  const first = JSON.parse(JSON.stringify(frames[0]));
  for (let i = 1; i < frames.length; i++) {
    mergeFrame(first, frames[i]);
  }
  return first;
};
