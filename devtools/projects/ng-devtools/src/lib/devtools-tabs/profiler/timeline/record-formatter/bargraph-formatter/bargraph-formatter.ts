import {ElementProfile, ProfilerFrame} from 'protocol';

import {memo} from '../../../../../vendor/memo-decorator';
import {RecordFormatter} from '../record-formatter';

export interface BargraphNode {
  parents: ElementProfile[];
  value: number;
  label: string;
  original: ElementProfile;
}

export class BarGraphFormatter extends RecordFormatter<BargraphNode[]> {
  @memo({cache: new WeakMap()})
  formatFrame(frame: ProfilerFrame): BargraphNode[] {
    const result: BargraphNode[] = [];
    this.addFrame(result, frame.directives);
    return result.filter((element) => element.value > 0).sort((a, b) => b.value - a.value);
  }

  addFrame(nodes: BargraphNode[], elements: ElementProfile[], parents: ElementProfile[] = []):
      number {
    let timeSpent = 0;
    elements.forEach((element) => {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }

      timeSpent += this.addFrame(nodes, element.children, parents.concat(element));
      timeSpent += super.getValue(element);

      element.directives.forEach((dir) => {
        const innerNode: BargraphNode = {
          parents,
          value: super.getDirectiveValue(dir),
          label: dir.name,
          original: element,
        };
        nodes.push(innerNode);
      });
    });
    return timeSpent;
  }
}
