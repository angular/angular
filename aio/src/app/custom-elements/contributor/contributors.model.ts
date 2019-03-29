export interface ContributorGroup {
  name: string;
  order: number;
  contributors: Contributor[];
}

export interface Contributor {
  group: string;
  name: string;
  picture?: string;
  website?: string;
  twitter?: string;
  bio?: string;
  isFlipped?: boolean;
}
