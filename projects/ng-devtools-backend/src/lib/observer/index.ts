import { ComponentTreeObserver } from './observer';
import { ElementPosition, ProfilerFrame, ElementProfile, DirectiveProfile } from 'protocol';
import { runOutsideAngular } from '../utils';
import { getComponentName } from '../highlighter';

let observer: ComponentTreeObserver;
let inProgress = false;
let inChangeDetection = false;
let eventMap: Map<any, DirectiveProfile>;

export const start = (onFrame: (frame: ProfilerFrame) => void): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  eventMap = new Map<any, DirectiveProfile>();
  inProgress = true;
  observer = new ComponentTreeObserver({
    onCreate(directive: any, id: number, isComponent: boolean, position: ElementPosition) {
      eventMap.set(directive, {
        name: getComponentName(directive),
        isComponent,
        changeDetection: 0,
        lifecycle: 0,
      });
    },
    onChangeDetection(component: any, id: number, position: ElementPosition, duration: number) {
      if (!inChangeDetection) {
        inChangeDetection = true;
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            onFrame(flushBuffer(observer, eventMap, getChangeDetectionSource()));
          });
        });
      }
      if (!eventMap.has(component)) {
        eventMap.set(component, {
          name: getComponentName(component),
          isComponent: true,
          changeDetection: 0,
          lifecycle: 0,
        });
      }
      const profile = eventMap.get(component);
      profile.changeDetection += duration;
    },
    onDestroy(component: any, id: number, isComponent: boolean, position: ElementPosition) {
      // TODO(mgechev): measure component removal
    },
  });
  observer.initialize();
};

export const stop = (): ProfilerFrame => {
  const result = flushBuffer(observer, eventMap);
  // We want to garbage collect the records;
  observer.destroy();
  inProgress = false;
  return result;
};

const insertElementProfile = (frames: ElementProfile[], position: ElementPosition, profile: DirectiveProfile) => {
  for (let i = 0; i < position.length - 1; i++) {
    const pos = position[i];
    if (!frames[pos]) {
      // console.warn('Unable to find parent node for', frames);
      return;
    }
    frames = frames[pos].children;
  }
  const lastIdx = position[position.length - 1];
  let lastFrame: ElementProfile = {
    children: [],
    directives: [],
  };
  if (frames[lastIdx]) {
    lastFrame = frames[lastIdx];
  } else {
    frames[lastIdx] = lastFrame;
  }
  lastFrame.directives.push(profile);
};

const flushBuffer = (obs: ComponentTreeObserver, events: Map<any, DirectiveProfile>, source: string = '') => {
  const items = Array.from(events.keys());
  const positions: ElementPosition[] = [];
  const positionDirective = new Map<ElementPosition, any>();
  items.forEach(dir => {
    const position = obs.getDirectivePosition(dir);
    positions.push(position);
    positionDirective.set(position, dir);
  });
  positions.sort(lexicographicOrder);
  const result: ProfilerFrame = {
    source,
    directives: [],
  };
  positions.forEach(position => {
    const dir = positionDirective.get(position);
    insertElementProfile(result.directives, position, events.get(dir));
  });
  return result;
};

const getChangeDetectionSource = () => {
  const zone = (window as any).Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};

const lexicographicOrder = (a: ElementPosition, b: ElementPosition) => {
  if (a.length < b.length) {
    return -1;
  }
  if (a.length > b.length) {
    return 1;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  return 0;
};
