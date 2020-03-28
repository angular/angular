import { AppEntry, RecordFormatter, TimelineView } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';

export interface FlamegraphNode {
  value: number;
  children: FlamegraphNode[];
  label: string;
  instances: number;
  original: ElementProfile;
}

export class FlamegraphFormatter extends RecordFormatter<FlamegraphNode> {
  format(records: ProfilerFrame[]): TimelineView<FlamegraphNode> {
    const result: TimelineView<FlamegraphNode> = {
      timeline: [],
    };
    records.forEach((record) => {
      this.insertTimelineRecord(result.timeline, record);
    });
    result.timeline = result.timeline.filter((entry) => entry.app.length > 0 && entry.timeSpent > 0);
    return result;
  }

  insertTimelineRecord(result: AppEntry<FlamegraphNode>[], record: ProfilerFrame): void {
    const entry: AppEntry<FlamegraphNode> = {
      app: [],
      timeSpent: 0,
      source: record.source,
    };
    entry.timeSpent = this.addFrame(entry.app, record.directives);
    result.push(entry);
  }

  addFrame(nodes: FlamegraphNode[], elements: ElementProfile[]): number {
    let timeSpent = 0;
    elements.forEach((element) => {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const node: FlamegraphNode = {
        value: super.getValue(element),
        label: super.getLabel(element),
        children: [],
        instances: 1,
        original: element,
      };
      timeSpent += this.addFrame(node.children, element.children);
      timeSpent += node.value;
      nodes.push(node);
    });
    return timeSpent;
  }
}
