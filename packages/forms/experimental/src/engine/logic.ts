import {FormNode} from './node';

export class LogicNode {
  disabled?: (node: FormNode) => boolean;

  element?: LogicNode;
  readonly children = new Map<PropertyKey, LogicNode>();
}
