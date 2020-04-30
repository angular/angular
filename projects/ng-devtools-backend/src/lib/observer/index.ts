import { getDirectiveName } from '../highlighter';
import { DirectiveForestObserver } from './observer';
import { LifecycleProfile } from 'protocol';

const markName = (s: string, method: Method) => `🅰️ ${s}#${method}`;

const supportsPerformance = globalThis.performance && typeof globalThis.performance.getEntriesByName === 'function';

type Method = keyof LifecycleProfile | 'changeDetection';

const recordMark = (s: string, method: Method) => {
  if (supportsPerformance) {
    performance.mark(`${markName(s, method)}_start`);
  }
};

const endMark = (nodeName: string, method: Method) => {
  if (supportsPerformance) {
    const name = markName(nodeName, method);
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

export let observer: DirectiveForestObserver;
export const getDirectiveForestObserver = () => {
  if (observer) {
    return observer;
  }
  observer = new DirectiveForestObserver({
    onChangeDetectionStart(component: any): void {
      recordMark(getDirectiveName(component), 'changeDetection');
    },
    onChangeDetectionEnd(component: any): void {
      endMark(getDirectiveName(component), 'changeDetection');
    },
    onLifecycleHookStart(component: any, lifecyle: keyof LifecycleProfile): void {
      recordMark(getDirectiveName(component), lifecyle);
    },
    onLifecycleHookEnd(component: any, lifecyle: keyof LifecycleProfile): void {
      endMark(getDirectiveName(component), lifecyle);
    },
  });
  observer.initialize();
  return observer;
};
