import {MdError} from '../core';

/**
 * Exception thrown when attempting to load an icon with a name that cannot be found.
 * @docs-private
 */
export class MdIconNameNotFoundError extends MdError {
  constructor(iconName: string) {
    super(`Unable to find icon with the name "${iconName}"`);
  }
}

/**
 * Exception thrown when attempting to load SVG content that does not contain the expected
 * <svg> tag.
 * @docs-private
 */
export class MdIconSvgTagNotFoundError extends MdError {
  constructor() {
    super('<svg> tag not found');
  }
}

/**
 * Exception thrown when the consumer attempts to use `<md-icon>` without including @angular/http.
 * @docs-private
 */
export class MdIconNoHttpProviderError extends MdError {
  constructor() {
    super('Could not find Http provider for use with Angular Material icons. ' +
          'Please include the HttpModule from @angular/http in your app imports.');
  }
}

/**
 * Exception thrown when an invalid icon name is passed to an md-icon component.
 * @docs-private
 */
export class MdIconInvalidNameError extends MdError {
  constructor(iconName: string) {
    super(`Invalid icon name: "${iconName}"`);
  }
}
