import { AppEntry, RecordFormatter, TimelineView } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';

export interface WebtreegraphNode {
  id: string;
  value: number;
  size: number;
  children: WebtreegraphNode[];
  original: ElementProfile;
}

export class WebtreegraphFormatter extends RecordFormatter<WebtreegraphNode> {
  format(records: ProfilerFrame[]): any {
    const result: TimelineView<WebtreegraphNode> = {
      timeline: [],
    };
    records.forEach(record => {
      this.insertTimelineRecord(result.timeline, record);
    });
    result.timeline = result.timeline.filter(entry => entry.app.length > 0 && entry.timeSpent > 0);
    return result;
  }

  insertTimelineRecord(result: AppEntry<WebtreegraphNode>[], record: ProfilerFrame): void {
    const entry: AppEntry<WebtreegraphNode> = {
      app: [],
      timeSpent: 0,
      source: record.source,
    };
    this.addFrame(entry.app, record.directives);

    const size = entry.app.reduce((accum, curr) => {
      return accum + curr.size;
    }, 0);
    entry.app = [
      {
        id: 'Application',
        size,
        value: size,
        children: entry.app,
        original: null,
      },
    ];
    entry.timeSpent = size;
    result.push(entry);
  }

  addFrame(nodes: WebtreegraphNode[], elements: ElementProfile[], prev: WebtreegraphNode = null): void {
    elements.forEach(element => {
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const nodeVal = super.getValue(element);
      const node: WebtreegraphNode = {
        id: super.getLabel(element),
        size: nodeVal,
        value: nodeVal,
        children: [],
        original: element,
      };
      this.addFrame(node.children, element.children, node);
      if (prev) {
        prev.size += node.size;
      }
      nodes.push(node);
    });
  }
}
