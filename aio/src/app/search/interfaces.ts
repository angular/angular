export interface SearchResults {
  query: string;
  results: SearchResult[];
}

export interface SearchResult {
  path: string;
  title: string;
  type: string;
  titleWords: string;
  keywords: string;
}

export interface SearchArea {
  name: string;
  pages: SearchResult[];
  priorityPages: SearchResult[];
}

