export interface DebuggingAPI {
  getComponent(node: Node): any;
  getDirectives(node: Node): any[];
  getHostElement(cmp: any): HTMLElement;
}
