import { AppRecord, ComponentEventType, ComponentRecord, LifeCycleEventType } from 'protocol';

export interface ComponentEntry {
  label: string;
  duration: number;
  total: number;
  instances: number;
}

export type AppTreeLevel = ComponentEntry[];

export interface AppEntry {
  app: AppTreeLevel[];
  timeSpent: number;
  source: string;
}

export interface TimelineView {
  aggregated: AppEntry;
  timeline: AppEntry[];
}

const processRecord = (record: ComponentRecord, bars: AppEntry): void => {
  const idx = record.id.length - 1;
  bars.app[idx] = bars.app[idx] || [];
  bars.timeSpent += record.duration;
  if (record.event !== ComponentEventType.ChangeDetection && record.event !== ComponentEventType.Create) {
    return;
  }
  let target = {
    label: record.component,
    duration: 0,
    total: 0,
    instances: 0,
  };
  let found = false;
  for (const result of bars.app[idx]) {
    if (result.label === record.component) {
      target = result;
      found = true;
      break;
    }
  }
  target.duration += record.duration;
  target.total++;
  if (record.event === ComponentEventType.Create) {
    target.instances++;
  }
  if (!found) {
    bars.app[idx].push(target);
  }
};

export const formatRecords = (records: AppRecord[]): TimelineView => {
  const result: TimelineView = {
    aggregated: {
      app: [],
      timeSpent: 0,
      source: ''
    },
    timeline: [{
      app: [],
      timeSpent: 0,
      source: ''
    }]
  };
  let currentSnapshot = -1;
  for (const record of records) {
    if (record.recordType === 'lifecycle' && record.event === LifeCycleEventType.ChangeDetectionStart) {
      currentSnapshot++;
      result.timeline.push({
        app: [],
        timeSpent: 0,
        source: record.source
      });
    }
    if (record.recordType === 'component') {
      processRecord(record, result.aggregated);
      processRecord(record, result.timeline[result.timeline.length - 1]);
    }
  }
  return result;
};
