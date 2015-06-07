import Filter from './broccoli-filter';
var minimatch = require('minimatch');

type FilterFunction = (contents: string, relativePath: string) => string;

export class Mapper extends Filter {
  private filter: string;
  private fn: FilterFunction;
  private _matches: {[key: string]: boolean} = Object.create(null);

  constructor(inputTree, filter: (string | FilterFunction), fn?: FilterFunction) {
    super(inputTree);
    if (typeof filter === 'function') {
      fn = <FilterFunction>(filter);
      filter = undefined;
    }
    if (typeof fn !== 'function') {
      throw new TypeError("[Mapper] expected parameter 'fn' to be a function.");
    }
    this.filter = <string>(filter);
    this.fn = fn;
  }

  canProcessFile(relativePath: string) {
    if (this.filter) {
      return this.match(relativePath);
    }
    return true;
  }

  getDestFilePath(relativePath: string) { return relativePath; }

  match(relativePath: string) {
    let cache = this._matches[relativePath];
    if (cache === undefined) {
      return this._matches[relativePath] = minimatch(relativePath, this.filter);
    }
    return cache;
  }

  processString(contents: string, relativePath: string) { return this.fn(contents, relativePath); }
}

export default function map(inputTree, filter, fn?) {
  // ASSERT(new.target === undefined);
  return new Mapper(inputTree, filter, fn);
}
