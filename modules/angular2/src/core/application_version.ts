export class Version {
  full: string = "NG_VERSION_FULL";  // all of these placeholder strings will be replaced by rake's
  major: string = "NG_VERSION_MAJOR";  // compile task
  minor: string = "NG_VERSION_MINOR";
  dot: string = "NG_VERSION_DOT";
  codeName: string = "NG_VERSION_CODENAME";
  constructor() {}
}

export var version = new Version();