/**
 * An interface to get and set the title
 */
export abstract class Title {
  abstract getTitle(): string;
  abstract setTitle(newTitle: string);
}

/**
 * An interface to read and change the Location
 */
// TODO(gdi2290): mark props as readonly after TypeScript 2.0 release
export abstract class Location {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
  origin: string;
  abstract assign(): string;
  abstract reload(): void;
  abstract replace(): void;
  abstract toString(): string;
}

/**
 * An interface to get the Global object
 */
export abstract class Global {}
