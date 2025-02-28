import {FormNode} from './node';

export interface FormError {
  kind: string;
  message?: string;
}

export class LogicNode {
  disabled?: (node: FormNode) => boolean;
  errors?: (node: FormNode) => FormError[];

  element?: LogicNode;
  readonly children = new Map<PropertyKey, LogicNode>();

  constructor(readonly parentDepths: number[]) {}
}
