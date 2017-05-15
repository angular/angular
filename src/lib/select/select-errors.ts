/**
 * Returns an exception to be thrown when attempting to change a s
 * elect's `multiple` option after initialization.
 * @docs-private
 */
export function getMdSelectDynamicMultipleError(): Error {
  return new Error('Cannot change `multiple` mode of select after initialization.');
}

/**
 * Returns an exception to be thrown when attempting to assign a non-array value to a select
 * in `multiple` mode. Note that `undefined` and `null` are still valid values to allow for
 * resetting the value.
 * @docs-private
 */
export function getMdSelectNonArrayValueError(): Error {
  return new Error('Cannot assign truthy non-array value to select in `multiple` mode.');
}
