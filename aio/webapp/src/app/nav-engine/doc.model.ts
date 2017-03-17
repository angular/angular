export interface Doc {
  metadata: NavigationMapEntry;
  content: string;
}

/**
 * Entry in the UI NavigationMap that describes a document or container of documents
 * Each entry corresponds to a link in the UI.
 * An entry has either a path or a url. If it has neither, it's a pure container.
 * An entry with entries is a container.
 * An entry with a path or a url is a document
 * An entry with both a path and entries is both a container and a document.
 */
export interface NavigationMapEntry {
  id: string;
  /** path to document in this site; empty string if there is no document. */
  path: string;
  /** true if a path lookup should favor this entry over others in the NavigationMap */
  primary?: boolean;
  /** url to an external web page; path and url are mutually exclusive. */
  url?: string;
  /** Title to display at the top of the document page in its header */
  title: string;
  /** Title to display in the navigation link; typically shorter */
  navTitle: string;
  /** Tooltip for links */
  tooltip: string;
  /** If defined, this entry is a container of child entries */
  entries?: NavigationMapEntry[];
  /** Ids of NavigationMapEntries higher in the hierarchy */
  ancestorIds: string[];
}

/**
 * The navigation hierarchy for the site.
 * Immediate properties are top-level sections.
 * Specifies some well-known top-level sections
 */
export interface NavigationMap {
  api?: NavigationMapEntry;
  core?: NavigationMapEntry;
  menu?: NavigationMapEntry;
  quickstart?: NavigationMapEntry;
  tutorial?: NavigationMapEntry;

  [index: string]: NavigationMapEntry;
}

/**
 * Navigation metadata for the site.
 * - navigationMap: the navigation hierarchy for the UI.
 * - docs: find metadata via the entry for a given document id.
 * - pathIds: find all entries on the route to a given document HTML path.
 */
export interface SiteMap {
  /**
   * NavigationMapEntry for a document id in the SiteMap.
   */
  docs: { [index: string]: NavigationMapEntry; };

  /**
   * NavigationMapEntries for an HTML path in the SiteMap.
   */
  paths: { [index: string]: NavigationMapEntry[]; };

  /**
   * Map that drives the UI navigation.
   * Top level titles correspond to navigation links in the UI.
   * Supports unlimited nesting.
   */
  navigationMap: NavigationMap;
}
