import { DirectiveProfile } from 'protocol';
import { SelectedDirective } from './timeline-visualizer.component';

export const formatDirectiveProfile = (nodes: DirectiveProfile[]) => {
  const graphData: SelectedDirective[] = [];
  nodes.forEach((node) => {
    const { changeDetection } = node;
    if (changeDetection) {
      graphData.push({
        directive: node.name,
        method: 'changes',
        value: parseFloat(changeDetection.toFixed(2)),
      });
    }
    Object.keys(node.lifecycle).forEach((key) => {
      graphData.push({
        directive: node.name,
        method: key,
        value: +node.lifecycle[key].toFixed(2),
      });
    });
    Object.keys(node.outputs).forEach((key) => {
      graphData.push({
        directive: node.name,
        method: key,
        value: +node.outputs[key].toFixed(2),
      });
    });
  });
  return graphData;
};
