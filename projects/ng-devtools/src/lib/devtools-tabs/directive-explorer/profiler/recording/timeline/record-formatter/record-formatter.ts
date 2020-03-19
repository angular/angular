import { ElementProfile, ProfilerFrame } from 'protocol';

export interface TimelineView<T> {
  timeline: AppEntry<T>[];
}

export interface AppEntry<T> {
  app: T[];
  timeSpent: number;
  source: string;
}

export interface GraphNode<T> extends AppEntry<T> {
  toolTip: string;
  style: any;
}

export abstract class RecordFormatter<T> {
  abstract format(records: ProfilerFrame[]): TimelineView<T>;
  abstract insertTimelineRecord(result: AppEntry<T>[], record: ProfilerFrame): void;
  abstract addFrame(nodes: T[], elements: ElementProfile[], prev?: T): number | void;

  getLabel(element: ElementProfile): string {
    const name = element.directives
      .filter(d => d.isComponent)
      .map(c => c.name)
      .join(', ');
    const attributes = [...new Set(element.directives.filter(d => !d.isComponent).map(d => d.name))].join(', ');
    return attributes === '' ? name : `${name}[${attributes}]`;
  }

  getValue(element: ElementProfile): number {
    let result = 0;
    element.directives.forEach(dir => {
      result += dir.changeDetection;
      Object.keys(dir.lifecycle).forEach(key => {
        const value = parseFloat(dir.lifecycle[key]);
        if (!isNaN(value)) {
          result += value;
        }
      });
    });
    return result;
  }
}
