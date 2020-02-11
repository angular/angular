import { ComponentTreeObserver, RecorderComponent } from './observer';
import { AppRecord, ComponentEventType, LifeCycleEventType } from 'protocol';
import { runOutsideAngular } from '../utils';
import { createRecord } from './record-factory';

let records: AppRecord[] = [];
let observer: ComponentTreeObserver;
let inProgress = false;
let inChangeDetection = false;

export const start = (): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  inProgress = true;
  observer = new ComponentTreeObserver(
    (component: RecorderComponent) => {
      records.push(createRecord({ recorderComponent: component, eventType: ComponentEventType.Create }));
    },
    (component: RecorderComponent, duration: number) => {
      if (!inChangeDetection) {
        inChangeDetection = true;
        records.push(createRecord({ eventType: LifeCycleEventType.ChangeDetectionStart }));
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            records.push(createRecord({ eventType: LifeCycleEventType.ChangeDetectionEnd }));
          });
        });
      }
      records.push(
        createRecord({ recorderComponent: component, eventType: ComponentEventType.ChangeDetection, duration })
      );
    },
    (component: RecorderComponent) => {
      records.push(createRecord({ recorderComponent: component, eventType: ComponentEventType.Destroy }));
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
