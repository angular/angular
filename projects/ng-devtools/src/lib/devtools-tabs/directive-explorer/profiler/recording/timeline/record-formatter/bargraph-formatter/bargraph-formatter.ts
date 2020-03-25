import { AppEntry, RecordFormatter, TimelineView } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';

export interface BargraphNode {
  value: number;
  name: string;
  original: ElementProfile;
}

export class BarGraphFormatter extends RecordFormatter<BargraphNode> {
  format(records: ProfilerFrame[]): TimelineView<BargraphNode> {
    const result: TimelineView<BargraphNode> = {
      timeline: [],
    };
    records.forEach((record) => {
      this.insertTimelineRecord(result.timeline, record);
    });
    result.timeline = result.timeline
      .filter((entry) => entry.app.length > 0 && entry.timeSpent > 0)
      .map((entry) => {
        entry.app = entry.app.filter((element) => element.value > 0).sort((a, b) => b.value - a.value);
        return entry;
      });
    console.log(result);
    return result;
  }

  insertTimelineRecord(result: AppEntry<BargraphNode>[], record: ProfilerFrame): void {
    const entry: AppEntry<BargraphNode> = {
      app: [],
      timeSpent: 0,
      source: record.source,
    };
    entry.timeSpent = this.addFrame(entry.app, record.directives);
    result.push(entry);
  }

  addFrame(nodes: BargraphNode[], elements: ElementProfile[]): number {
    let timeSpent = 0;
    elements.forEach((element) => {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const node: BargraphNode = {
        value: super.getValue(element),
        name: super.getLabel(element) + addSpaces(nodes.length),
        original: element,
      };
      // nodes.push(node);
      timeSpent += this.addFrame(nodes, element.children);
      timeSpent += node.value;

      element.directives.forEach((dir) => {
        const innerNode: BargraphNode = {
          value: dir.changeDetection,
          name: dir.name + addSpaces(nodes.length),
          original: element,
        };
        nodes.push(innerNode);
      });
    });
    return timeSpent;
  }
}

const addSpaces = (length: number) => Array.from(Array(length).keys()).reduce((acc, _) => acc + ' ', '');
