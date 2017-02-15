export interface Doc {
  node: NavigationNode;
  content: string;
}

/**
 * UI navigation node that describes a document or container of documents
 * Each node corresponds to a link in the UI.
 */
export interface NavigationNode {
  /** Id of this node in the navigation map */
  id: string;
  /** path to corresponding document in this site; empty string if there is no document. */
  path: string;
  /** url to an external web page; path and url are mutually exclusive. */
  url?: string;
  /** Title to display at the top of the document page in its header */
  title: string;
  /** Title to display in the navigation link; typically shorter */
  navTitle: string;
  /** Tooltip for links */
  tooltip: string;
  /** Ids of ancestor nodes higher in the hierarchy */
  ancestorIds: string[];
  /** true if a path lookup should favor this node over others with the same path */
  primary?: boolean;
  /** true if should not be displayed in UI. Can still be loaded directly */
  hide?: boolean;
  /** If defined, this node is a container of child nodes */
  children?: NavigationNode[];
}


/**
 * Navigation metadata for the site.
 * - navigationMap: the navigation hierarchy for the UI.
 * - docs: find node for a given document id.
 * - paths: find all node for a given HTML path.
 */
export interface SiteMap {
  /**
   * Map that drives the UI navigation.
   * Each node correspond to a navigation link in the UI.
   * Supports unlimited node nesting.
   */
  navigationMap: Map<string, NavigationNode>;

  /**
   * NavigationNode for a document id in the SiteMap.
   */
  docs: { [index: string]: NavigationNode; };

  /**
   * NavigationNodes for an HTML path in the SiteMap.
   */
  paths: { [index: string]: NavigationNode[]; };
}
