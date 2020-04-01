import { RecordFormatter } from '../record-formatter';
import { ElementProfile, ProfilerFrame } from 'protocol';

export interface FlamegraphNode {
  value: number;
  color?: string;
  children: FlamegraphNode[];
  label: string;
  instances: number;
  original: ElementProfile;
  changeDetected: boolean;
}

export const ROOT_LEVEL_ELEMENT_LABEL = 'Entire application';

export class FlamegraphFormatter extends RecordFormatter<FlamegraphNode> {
  formatFrame(frame: ProfilerFrame, showChangeDetection?: boolean): FlamegraphNode {
    const result: FlamegraphNode = {
      value: 0,
      label: ROOT_LEVEL_ELEMENT_LABEL,
      children: [],
      color: '#ccc',
      instances: 1,
      changeDetected: false,
      original: {
        children: [],
        directives: [],
      },
    };

    this.addFrame(result.children, frame.directives, showChangeDetection);
    return result;
  }

  addFrame(nodes: FlamegraphNode[], elements: ElementProfile[], showChangeDetection?: boolean): number {
    let timeSpent = 0;
    elements.forEach((element) => {
      // Possibly undefined because of
      // the insertion on the backend.
      if (!element) {
        console.error('Unable to insert undefined element');
        return;
      }
      const changeDetected = didRunChangeDetection(element);
      const node: FlamegraphNode = {
        value: super.getValue(element),
        label: super.getLabel(element),
        children: [],
        instances: 1,
        original: element,
        changeDetected,
      };
      if (showChangeDetection) {
        node.color = changeDetected ? CHANGE_DETECTION_COLOR : NO_CHANGE_DETECTION_COLOR;
      }
      timeSpent += this.addFrame(node.children, element.children, showChangeDetection);
      timeSpent += node.value;
      nodes.push(node);
    });
    return timeSpent;
  }
}

const CHANGE_DETECTION_COLOR = '#3A8249';
const NO_CHANGE_DETECTION_COLOR = '#ccc';

const didRunChangeDetection = (profile: ElementProfile) => {
  const components = profile.directives.filter((d) => d.isComponent);
  if (!components.length) {
    return false;
  }
  return components.some((c) => c.changeDetection !== undefined);
};
