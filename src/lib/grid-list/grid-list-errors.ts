import {MdError} from '@angular2-material/core/errors/error';

/**
 * Exception thrown when cols property is missing from grid-list
 */
export class MdGridListColsError extends MdError {
  constructor() {
    super(`md-grid-list: must pass in number of columns. Example: <md-grid-list cols="3">`);
  }
}

/**
 * Exception thrown when a tile's colspan is longer than the number of cols in list
 */
export class MdGridTileTooWideError extends MdError {
  constructor(cols: number, listLength: number) {
    super(`md-grid-list: tile with colspan ${cols} is wider than grid with cols="${listLength}".`);
  }
}

/**
 * Exception thrown when an invalid ratio is passed in as a rowHeight
 */
export class MdGridListBadRatioError extends MdError {
  constructor(value: string) {
    super(`md-grid-list: invalid ratio given for row-height: "${value}"`);
  }
}
