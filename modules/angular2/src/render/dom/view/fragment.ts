import {RenderFragmentRef} from '../../api';

export function resolveInternalDomFragment(fragmentRef: RenderFragmentRef): Node[] {
  return (<DomFragmentRef>fragmentRef)._nodes;
}

export class DomFragmentRef extends RenderFragmentRef {
  constructor(public _nodes: Node[]) { super(); }
}
