import { RecordFormatter } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';
import memo from 'memo-decorator';

export interface FlamegraphNode {
  value: number;
  color?: string;
  children: FlamegraphNode[];
  label: string;
  instances: number;
  original: ElementProfile;
}

export const ROOT_LEVEL_ELEMENT_LABEL = 'Entire application';

export class FlamegraphFormatter extends RecordFormatter<FlamegraphNode> {
  @memo() formatFrame(frame: ProfilerFrame): FlamegraphNode {
    const result: FlamegraphNode = {
      value: 0,
      label: ROOT_LEVEL_ELEMENT_LABEL,
      children: [],
      color: '#ccc',
      instances: 1,
      original: {
        children: [],
        directives: [],
      },
    };

    this.addFrame(result.children, frame.directives);
    return result;
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
