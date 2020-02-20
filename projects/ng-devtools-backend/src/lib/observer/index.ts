import { ComponentTreeObserver } from './observer';
import {
  AppRecord,
  DirectiveEventType,
  ElementPosition,
  LifeCycleEventType,
  Events,
  MessageBus,
  ComponentEventType,
} from 'protocol';
import { runOutsideAngular } from '../utils';
import { serializeComponentState } from '../state-serializer/state-serializer';
import { getComponentName } from '../highlighter';

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
      if (isComponent) {
        records.push({
          timestamp: Date.now(),
          event: ComponentEventType.Create,
          recordType: 'component',
          component: getComponentName(component),
          position: [...position],
          state: { props: serializeComponentState(component, 1) },
          duration: 0,
        });
      } else {
        records.push({
          timestamp: Date.now(),
          event: DirectiveEventType.Create,
          recordType: 'directive',
          directive: getComponentName(component),
          position: [...position],
          state: { props: serializeComponentState(component, 1) },
          duration: 0,
        });
      }
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
      records.push({
        timestamp: Date.now(),
        event: ComponentEventType.ChangeDetection,
        recordType: 'component',
        component: getComponentName(component),
        position: [...position],
        state: { props: serializeComponentState(component, 1) },
        duration,
      });
    },
    onDestroy(component: any, id: number, isComponent: boolean, position: ElementPosition) {
      if (isComponent) {
        records.push({
          timestamp: Date.now(),
          event: ComponentEventType.Destroy,
          recordType: 'component',
          component: getComponentName(component),
          position: [...position],
          state: { props: serializeComponentState(component, 1) },
          duration: 0,
        });
      } else {
        records.push({
          timestamp: Date.now(),
          event: DirectiveEventType.Destroy,
          recordType: 'directive',
          directive: getComponentName(component),
          position: [...position],
          state: { props: serializeComponentState(component, 1) },
          duration: 0,
        });
      }
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
