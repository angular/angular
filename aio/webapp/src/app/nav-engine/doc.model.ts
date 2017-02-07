export interface DocMetadata {
  id: string;    // 'home'
  title: string; // 'Home'
  url: string;   // 'content/documents/home.html'
}

export interface Doc {
  metadata: DocMetadata;
  content: string;
}
