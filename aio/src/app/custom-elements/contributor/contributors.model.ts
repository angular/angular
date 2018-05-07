export class ContributorGroup {
  name: string;
  order: number;
  contributors: Contributor[];
}

export class Contributor {
  group: string;
  name: string;
  picture?: string;
  website?: string;
  twitter?: string;
  bio?: string;
  isFlipped ? = false;
}
