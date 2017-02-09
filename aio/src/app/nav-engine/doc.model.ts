export interface DocMetadata {
  id: string;    // 'home'
  title: string; // 'Home'
  url: string;   // 'assets/documents/home.html'
}

export interface Doc {
  metadata: DocMetadata;
  content: string;
}
