import { AppEntry, RecordFormatter, TimelineView } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';

export interface BargraphNode {
  parents: ElementProfile[];
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
    entry.timeSpent = this.addFrames(entry.app, record.directives, []);
    result.push(entry);
  }

  addFrame(nodes: BargraphNode[], elements: ElementProfile[]): number {
    return -1;
  }

  addFrames(nodes: BargraphNode[], elements: ElementProfile[], parents: ElementProfile[]): number {
    let timeSpent = 0;
    const suffix = addSpaces(nodes.length);
    elements.forEach((element) => {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }

      timeSpent += this.addFrames(nodes, element.children, parents.concat(element));
      timeSpent += super.getValue(element);

      element.directives.forEach((dir) => {
        const innerNode: BargraphNode = {
          parents,
          value: super.getDirectiveValue(dir),
          name: dir.name + suffix,
          original: element,
        };
        nodes.push(innerNode);
      });
    });
    return timeSpent;
  }
}

const addSpaces = (length: number) => ' '.repeat(length);
