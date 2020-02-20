import { ComponentTreeObserver } from './observer';
import { AppRecord, ComponentEventType, ElementPosition, LifeCycleEventType, Events, MessageBus } from 'protocol';
import { runOutsideAngular } from '../utils';
import { createDirectiveEventRecord } from './record-factory';

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
      records.push(
        createDirectiveEventRecord({
          recorderComponent: { component, position, isComponent },
          eventType: ComponentEventType.Create,
        })
      );
    },
    onChangeDetection(component: any, id: number, position: ElementPosition, duration: number) {
      if (!inChangeDetection) {
        inChangeDetection = true;
        records.push({
          recordType: 'lifecycle',
          event: LifeCycleEventType.ChangeDetectionStart,
          source: getChangeDetectionSource(),
          timestamp: Date.now(),
        });
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            addNewRecord(
              {
                recordType: 'lifecycle',
                event: LifeCycleEventType.ChangeDetectionEnd,
                timestamp: Date.now(),
              },
              messageBus
            );
          });
        });
      }
      records.push(
        createDirectiveEventRecord({
          recorderComponent: { component, position, isComponent: true },
          eventType: ComponentEventType.ChangeDetection,
        })
      );
    },
    onDestroy(component: any, id: number, isComponent: boolean, position: ElementPosition) {
      records.push(
        createDirectiveEventRecord({
          recorderComponent: { component, position, isComponent },
          eventType: ComponentEventType.Destroy,
        })
      );
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

const getChangeDetectionSource = () => {
  const zone = (window as any).Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};
