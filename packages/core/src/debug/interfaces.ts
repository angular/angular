
import {DebugNode} from './debug_node';

import {DebuggableNode} from './query';

export interface DebugElementInterface {
  name: string;
  properties: {[key: string]: any};
  attributes: {[key: string]: string | null};
  classes: {[key: string]: boolean};
  styles: {[key: string]: string | null};
  childNodes: DebuggableNode[];
  nativeElement: any;
  addChild(child: DebugNode): void;
  removeChild(child: DebugNode): void;
}
