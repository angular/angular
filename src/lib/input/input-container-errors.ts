/** @docs-private */
export function getMdInputContainerPlaceholderConflictError(): Error {
  return new Error('Placeholder attribute and child element were both specified.');
}

/** @docs-private */
export function getMdInputContainerUnsupportedTypeError(type: string): Error {
  return new Error(`Input type "${type}" isn't supported by md-input-container.`);
}

/** @docs-private */
export function getMdInputContainerDuplicatedHintError(align: string): Error {
  return new Error(`A hint was already declared for 'align="${align}"'.`);
}

/** @docs-private */
export function getMdInputContainerMissingMdInputError(): Error {
  return new Error('md-input-container must contain an mdInput directive. ' +
                   'Did you forget to add mdInput to the native input or textarea element?');
}
