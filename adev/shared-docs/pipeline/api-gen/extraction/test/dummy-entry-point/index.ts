export class Version {
  constructor(public sha: string = '') {}
}

export const VERSION = new Version('123abc');
