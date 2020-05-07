import { getDirectiveName } from '../highlighter';
import { DirectiveForestObserver } from './observer';
import { LifecycleProfile } from 'protocol';

const markName = (s: string, method: Method) => `🅰️ ${s}#${method}`;

const supportsPerformance = globalThis.performance && typeof globalThis.performance.getEntriesByName === 'function';

type Method = keyof LifecycleProfile | 'changeDetection';

const recordMark = (s: string, method: Method) => {
  console.count('recordMark');
  if (supportsPerformance) {
    performance.mark(`${markName(s, method)}_start`);
  }
};

const endMark = (nodeName: string, method: Method) => {
  console.count('endMark');
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

let timingAPIFlag = false;

export const enableTimingAPI = () => (timingAPIFlag = true);
export const disableTimingAPI = () => (timingAPIFlag = false);

const timingAPIEnabled = () => timingAPIFlag;

export let observer: DirectiveForestObserver;
export const initializeOrGetDirectiveForestObserver = () => {
  if (observer) {
    return observer;
  }
  observer = new DirectiveForestObserver({
    onChangeDetectionStart(component: any): void {
      if (!timingAPIEnabled()) {
        return;
      }
      recordMark(getDirectiveName(component), 'changeDetection');
    },
    onChangeDetectionEnd(component: any): void {
      if (!timingAPIEnabled()) {
        return;
      }
      endMark(getDirectiveName(component), 'changeDetection');
    },
    onLifecycleHookStart(component: any, lifecyle: keyof LifecycleProfile): void {
      if (!timingAPIEnabled()) {
        return;
      }
      recordMark(getDirectiveName(component), lifecyle);
    },
    onLifecycleHookEnd(component: any, lifecyle: keyof LifecycleProfile): void {
      if (!timingAPIEnabled()) {
        return;
      }
      endMark(getDirectiveName(component), lifecyle);
    },
  });
  observer.initialize();
  return observer;
};
