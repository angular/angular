import { AppRecord, ComponentEventType as DirectiveEventType, ElementPosition, LifeCycleEventType } from 'protocol';
import { getComponentName } from '../highlighter';
import { serializeComponentState } from '../state-serializer/state-serializer';

export interface RecorderComponent {
  component: any;
  position: ElementPosition;
}

export interface RecorderDirective extends RecorderComponent {
  isComponent: boolean;
}

export interface RecorderDirectiveEventOptions {
  eventType: DirectiveEventType;
  duration?: number;
  recorderComponent: RecorderDirective;
}

export interface RecorderLifecycleEventOptions {
  eventType: LifeCycleEventType;
  duration: number;
  recorderComponent: RecorderComponent;
}

export const createDirectiveEventRecord = (options: RecorderDirectiveEventOptions): AppRecord => {
  const record: AppRecord = {
    timestamp: Date.now(),
    event: options.eventType,
    recordType: 'component',
    component: getComponentName(options.recorderComponent.component),
    position: [...options.recorderComponent.position],
    state: { props: serializeComponentState(options.recorderComponent.component, 1) },
    duration: 0,
  };
  return record;
};
