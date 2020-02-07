import { ComponentTreeObserver, RecorderComponent } from './observer';
import { getComponentName } from '../highlighter';
import { AppRecord, ComponentEventType, LifeCycleEventType } from 'protocol';
import { serializeComponentState } from '../state-serializer';
import { runOutsideAngular } from '../utils';

let records: AppRecord[] = [];
let observer: ComponentTreeObserver;
let inProgress = false;
let inChangeDetection = false;

const getChangeDetectionSource = () => {
  const zone = (window as any).Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};

export const start = (): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  inProgress = true;
  observer = new ComponentTreeObserver(
    (component: RecorderComponent) => {
      records.push({
        recordType: 'component',
        timestamp: Date.now(),
        component: getComponentName(component.component),
        state: { props: serializeComponentState(component.component, 2) },
        id: [...component.id],
        event: ComponentEventType.Create,
        duration: 0,
      });
    },
    (component: RecorderComponent, duration: number) => {
      if (!inChangeDetection) {
        inChangeDetection = true;
        records.push({
          timestamp: Date.now(),
          recordType: 'lifecycle',
          event: LifeCycleEventType.ChangeDetectionStart,
          source: getChangeDetectionSource(),
        });
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            records.push({
              timestamp: Date.now(),
              recordType: 'lifecycle',
              event: LifeCycleEventType.ChangeDetectionEnd,
            });
          });
        });
      }
      records.push({
        recordType: 'component',
        timestamp: Date.now(),
        component: getComponentName(component.component),
        id: [...component.id],
        event: ComponentEventType.ChangeDetection,
        state: { props: serializeComponentState(component.component, 1) },
        duration,
      });
    },
    (component: RecorderComponent) => {
      records.push({
        recordType: 'component',
        timestamp: Date.now(),
        component: getComponentName(component.component),
        state: { props: serializeComponentState(component.component, 2) },
        id: [...component.id],
        event: ComponentEventType.Destroy,
        duration: 0,
      });
    }
  );
  observer.initialize();
};

export const stop = (): AppRecord[] => {
  observer.destroy();
  // We want to garbage collect the records;
  const temp = records;
  records = [];
  inProgress = false;
  return temp;
};
