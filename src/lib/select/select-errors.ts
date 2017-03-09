import {MdError} from '../core/errors/error';

/**
 * Exception thrown when attempting to change a select's `multiple` option after initialization.
 * @docs-private
 */
export class MdSelectDynamicMultipleError extends MdError {
  constructor() {
    super('Cannot change `multiple` mode of select after initialization.');
  }
}

/**
 * Exception thrown when attempting to assign a non-array value to a select in `multiple` mode.
 * Note that `undefined` and `null` are still valid values to allow for resetting the value.
 * @docs-private
 */
export class MdSelectNonArrayValueError extends MdError {
  constructor() {
    super('Cannot assign truthy non-array value to select in `multiple` mode.');
  }
}
