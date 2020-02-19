import { AppRecord, ComponentEventType, ElementID, LifeCycleEventType } from 'protocol';
import { getComponentName } from '../highlighter';
import { serializeComponentState } from '../state-serializer/state-serializer';

export interface RecorderComponent {
  component: any;
  id: ElementID;
}

export interface RecordFactoryOptions {
  eventType: ComponentEventType | LifeCycleEventType;
  duration?: number;
  recorderComponent?: RecorderComponent;
}

export const createRecord = (options: RecordFactoryOptions): AppRecord => {
  let record = {
    timestamp: Date.now(),
    event: options.eventType,
  };
  if (options.recorderComponent) {
    record = {
      ...record,
      ...createComponentEventTypeRecord(
        options.recorderComponent,
        options.duration,
        options.eventType as ComponentEventType
      ),
    };
  } else {
    record = {
      ...record,
      ...createLifeCycleEventTypeRecord(options.eventType as LifeCycleEventType),
    };
  }
  return record as AppRecord;
};

const createComponentEventTypeRecord = (
  recorderComponent: RecorderComponent,
  duration: number,
  eventType: ComponentEventType
) => {
  const baseComponentEventTypeRecord = {
    recordType: 'component',
    component: getComponentName(recorderComponent.component),
    id: [...recorderComponent.id],
    state: { props: serializeComponentState(recorderComponent.component, 1) },
    duration: 0,
  };

  switch (eventType) {
    case ComponentEventType.ChangeDetection:
      return {
        ...baseComponentEventTypeRecord,
        duration,
      };
    case ComponentEventType.Destroy:
    case ComponentEventType.Create:
      return {
        ...baseComponentEventTypeRecord,
      };
  }
};

const createLifeCycleEventTypeRecord = (eventType: LifeCycleEventType) => {
  const baseLifeCycleEventTypeRecord = {
    recordType: 'lifecycle',
  };

  switch (eventType) {
    case LifeCycleEventType.ChangeDetectionStart:
      return {
        source: getChangeDetectionSource(),
        ...baseLifeCycleEventTypeRecord,
      };
    case LifeCycleEventType.ChangeDetectionEnd:
      return { ...baseLifeCycleEventTypeRecord };
  }
};

const getChangeDetectionSource = () => {
  const zone = (window as any).Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};
