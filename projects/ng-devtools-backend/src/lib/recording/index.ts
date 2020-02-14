import { ComponentTreeObserver, RecorderComponent } from './observer';
import { AppRecord, ComponentEventType, Events, LifeCycleEventType, MessageBus } from 'protocol';
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
    onCreate(component: RecorderComponent) {
      records.push(createRecord({ recorderComponent: component, eventType: ComponentEventType.Create }));
    },
    onChangeDetection(component: RecorderComponent, duration: number) {
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
      addNewRecord(
        createRecord({ recorderComponent: component, eventType: ComponentEventType.ChangeDetection, duration }),
        messageBus
      );
    },
    onDestroy(component: RecorderComponent) {
      records.push(createRecord({ recorderComponent: component, eventType: ComponentEventType.Destroy }));
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
