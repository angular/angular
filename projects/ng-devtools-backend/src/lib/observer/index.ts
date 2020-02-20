import { ComponentTreeObserver } from './observer';
import { AppRecord, ComponentEventType, ElementPosition, LifeCycleEventType, Events, MessageBus } from 'protocol';
import { runOutsideAngular } from '../utils';
import { createRecord } from './record-factory';

let records: AppRecord[] = [];
let observer: ComponentTreeObserver;
let inProgress = false;
let inChangeDetection = false;

export const start = (messageBus: MessageBus<Events>): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  inProgress = true;
  observer = new ComponentTreeObserver({
    onCreate(component: any, id: number, isComponent: boolean, position: ElementPosition) {
      if (!isComponent) {
        return;
      }
      records.push(createRecord({ recorderComponent: { component, position }, eventType: ComponentEventType.Create }));
    },
    onChangeDetection(component: any, id: number, position: ElementPosition, duration: number) {
      if (!inChangeDetection) {
        inChangeDetection = true;
        records.push(createRecord({ eventType: LifeCycleEventType.ChangeDetectionStart }));
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            addNewRecord(createRecord({ eventType: LifeCycleEventType.ChangeDetectionEnd }), messageBus);
          });
        });
      }
      records.push(
        createRecord({
          recorderComponent: { component, position },
          eventType: ComponentEventType.ChangeDetection,
          duration,
        })
      );
    },
    onDestroy(component: any, id: number, isComponent: boolean, position: ElementPosition) {
      if (!isComponent) {
        return;
      }
      records.push(createRecord({ recorderComponent: { component, position }, eventType: ComponentEventType.Destroy }));
    },
  });
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

const addNewRecord = (record: AppRecord, messageBus: MessageBus<Events>) => {
  records.push(record);
  if (!inChangeDetection) {
    messageBus.emit('sendProfilerChunk', [records]);
    records = [];
  }
};
