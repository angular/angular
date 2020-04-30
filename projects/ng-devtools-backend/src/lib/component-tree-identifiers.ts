import { DirectiveForestObserver } from './observer/observer';
import { getDirectiveName } from './highlighter';

let observer: DirectiveForestObserver;

const markName = (s: string) => `🅰️ ${s}`;

const supportsPerformance = globalThis.performance && typeof globalThis.performance.getEntriesByName === 'function';

const recordMark = (s: string) => {
  if (supportsPerformance) {
    performance.mark(markName(s));
  }
};

const endMark = (nodeName: string) => {
  if (supportsPerformance) {
    const name = markName(nodeName);
    const start = `${name}_start`;
    const end = `${name}_end`;
    if (performance.getEntriesByName(start).length > 0) {
      performance.mark(end);
      performance.measure(name, start, end);
    }
    performance.clearMarks(start);
    performance.clearMarks(end);
    performance.clearMeasures(name);
  }
};

export const observeDOM = () => {
  if (observer) {
    console.error('Cannot initialize the DOM observer more than once');
    return;
  }
  observer = new DirectiveForestObserver({
    onChangeDetectionStart(component: any): void {
      recordMark(`${getDirectiveName(component)}_start`);
    },
    onChangeDetectionEnd(component: any): void {
      endMark(getDirectiveName(component));
    },
  });
  observer.initialize();
};

export const getDirectiveId = (dir: any) => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return -1;
  }
  return observer.getDirectiveId(dir);
};

export const getDirectiveForest = () => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return [];
  }
  return observer.getDirectiveForest();
};

export const indexDirectiveForest = () => {
  observer.indexForest();
};

export const getDirectivePosition = (dir: any) => {
  if (!observer) {
    console.warn('Observer not yet instantiated');
    return null;
  }
  return observer.getDirectivePosition(dir);
};
