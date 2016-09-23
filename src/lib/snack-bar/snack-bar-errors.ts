import {MdError} from '../core';


export class MdSnackBarContentAlreadyAttached extends MdError {
  constructor() {
      super('Attempting to attach snack bar content after content is already attached');
  }
}
