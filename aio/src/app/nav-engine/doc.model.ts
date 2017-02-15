export interface DocMetadata {
  docId: string;
  title: string;
}

export interface Doc {
  metadata: DocMetadata;
  content: string;
}

/**
 * UI navigation node that describes a document or container of documents
 * Each node corresponds to a link in the UI.
 */
export interface NavNode {
  /** unique integer id for this node */
  id: number;
  /** Document id if this is a document node */
  docId: string;
  /** Document path (calculated from docId) if this is a document node */
  docPath: string;
  /** url to an external web page; docPath and url are mutually exclusive. */
  url?: string;
  /** Title to display in the navigation link; typically shorter */
  navTitle: string;
  /** Tooltip for links */
  tooltip: string;
  /** Ids of ancestor nodes higher in the hierarchy */
  ancestorIds: number[];
  /** true if should not be displayed in UI. Can still be loaded directly */
  // hide?: boolean;  NO NO.  If the JSON says, hide, simply omit it from this map
  /** If defined, this node is a container of child nodes */
  children?: NavNode[];
}


/**
 * Navigation for the site.
 * - nodes: the top-level navigation nodes; node can have children.
 * - docs: find node for a given document id.
 */
export interface NavMap {
  /**
   * Map that drives the UI navigation.
   * Each node correspond to a navigation link in the UI.
   * Supports unlimited node nesting.
   */
  nodes: NavNode[];

  /**
   * NavNode for a document id in the NavMap.
   */
  docs: Map<string, NavNode>;
}
