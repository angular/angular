import { ComponentEventType, Properties, AppRecord, ComponentRecord } from 'protocol';
import clone from 'clone-deep';

export enum TimelineNodeState {
  Check,
  Default,
}

export interface TimelineNode {
  name: string;
  state: TimelineNodeState;
  instanceState: Properties;
  duration?: number;
  children: TimelineNode[];
}

export interface TimelineFrame {
  timestamp: number;
  timeLineId?: number;
  roots: TimelineNode[];
}

export type Timeline = TimelineFrame[];

const idCounter = () => {
  let count = 0;
  return {
    getId: () => count++,
    resetIdAutoIncrement: () => (count = 0),
  };
};

export const { getId, resetIdAutoIncrement } = idCounter();

const buildInitialState = (records: ComponentRecord[]): { initialState: TimelineFrame; consumed: number } => {
  if (!records.length) {
    return {
      initialState: {
        timeLineId: getId(),
        roots: [],
        timestamp: 0,
      },
      consumed: 0,
    };
  }
  const initialState: TimelineFrame = {
    timestamp: records[0].timestamp,
    roots: [],
    timeLineId: getId(),
  };
  let consumed = 0;
  for (const record of records) {
    if (record.event !== ComponentEventType.Create) {
      return { initialState, consumed };
    }
    let currentNode = initialState.roots[record.position[0]];
    if (currentNode === undefined && record.position.length > 1) {
      throw new Error('Cannot find the specified node');
    }
    if (currentNode === undefined) {
      currentNode = {
        name: record.component,
        instanceState: record.state,
        state: TimelineNodeState.Default,
        children: [],
      } as TimelineNode;
      initialState.roots[record.position[0]] = currentNode;
      consumed++;
      continue;
    }
    for (let i = 1; i < record.position.length - 1; i++) {
      currentNode = currentNode.children[record.position[i]];
    }
    currentNode.children[record.position[record.position.length - 1]] = {
      name: record.component,
      instanceState: record.state,
      state: TimelineNodeState.Default,
      children: [],
    };
    consumed++;
  }
  return { initialState, consumed };
};

const applyChangeDetectionMutation = (frame: TimelineFrame, record: ComponentRecord) => {
  let children = frame.roots;
  let current: TimelineNode;
  for (const step of record.position) {
    current = children[step];
    if (!current) {
      console.error('Unable to find node in time travel in change detection', record, frame);
      return;
    }
    children = current.children;
  }
  current.state = TimelineNodeState.Check;
  current.instanceState = record.state;
  current.duration = record.duration;
  frame.timestamp = record.timestamp;
};

const applyCreationMutation = (frame: TimelineFrame, record: ComponentRecord) => {
  let children = frame.roots;
  let current: TimelineNode;
  for (let i = 0; i < record.position.length - 1; i++) {
    current = children[record.position[i]];
    if (!current) {
      console.error('Unable to find node in time travel in creation', record, frame);
      return;
    }
    children = current.children;
  }
  children[record.position[record.position.length - 1]] = {
    name: record.component,
    instanceState: record.state,
    children: [],
    state: TimelineNodeState.Default,
  };
  frame.timestamp = record.timestamp;
};

const applyDeletionMutation = (frame: TimelineFrame, record: ComponentRecord) => {
  let children = frame.roots;
  let current: TimelineNode;
  for (let i = 0; i < record.position.length - 1; i++) {
    current = children[record.position[i]];
    if (!current) {
      console.error('Unable to find node in time travel in deletion', record, frame);
      return;
    }
    children = current.children;
  }
  const lastIdx = record.position[record.position.length - 1];
  // We might have replaced the node already, we don't want to delete in such case.
  if (children[lastIdx] && children[lastIdx].name === record.component) {
    children.splice(record.position[record.position.length - 1], 1);
  }
  frame.timestamp = record.timestamp;
};

const applyMutation = (frame: TimelineFrame, record: ComponentRecord): TimelineFrame => {
  switch (record.event) {
    case ComponentEventType.ChangeDetection:
      applyChangeDetectionMutation(frame, record);
      break;
    case ComponentEventType.Create:
      applyCreationMutation(frame, record);
      break;
    case ComponentEventType.Destroy:
      applyDeletionMutation(frame, record);
      break;
  }
  frame.timeLineId = getId();
  return frame;
};

const undoChangeDetectionMutation = (frame: TimelineFrame, record: ComponentRecord) => {
  let children = frame.roots;
  let current: TimelineNode;
  for (const step of record.position) {
    current = children[step];
    if (!current) {
      console.error('Unable to find node in time travel in undo change detection', record, frame);
      return;
    }
    children = current.children;
  }
  current.state = TimelineNodeState.Default;
  delete current.duration;
};

export const buildTimeline = (input: AppRecord[]): Timeline => {
  const records = input.filter(r => r.recordType === 'component') as ComponentRecord[];
  const result: Timeline = [];
  const { initialState, consumed } = buildInitialState(records);
  const initialTimestamp = initialState.timestamp;
  initialState.timestamp = 0;
  result.push(initialState);
  for (let i = consumed; i < records.length; i++) {
    const last = clone(result[result.length - 1]);
    if (records[i - 1].event === ComponentEventType.ChangeDetection) {
      undoChangeDetectionMutation(last, records[i - 1]);
    }
    records[i].timestamp -= initialTimestamp;
    result.push(applyMutation(last, records[i]));
  }
  return result;
};
