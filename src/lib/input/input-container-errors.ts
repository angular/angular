import {MdError} from '../core/errors/error';


export class MdInputContainerPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}


export class MdInputContainerUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input-container.`);
  }
}


export class MdInputContainerDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}
