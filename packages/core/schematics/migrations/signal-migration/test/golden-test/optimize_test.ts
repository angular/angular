// tslint:disable

import {AppComponent} from './index';

function assertValidLoadingInput(dir: AppComponent) {
  if (dir.withUndefinedInput && dir.narrowableMultipleTimes) {
    throw new Error(``);
  }
  const validInputs = ['auto', 'eager', 'lazy'];
  if (typeof dir.withUndefinedInput === 'string' && !validInputs.includes(dir.withUndefinedInput)) {
    throw new Error();
  }
}
