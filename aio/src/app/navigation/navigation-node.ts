export interface NavigationNode {
  url?: string;
  title?: string;
  tooltip?: string;
  target?: string;
  children?: NavigationNode[];
}
