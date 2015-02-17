import {Decorator} from 'angular2/angular2';
import {PropertySetter} from 'angular2/src/core/annotations/di';

@Decorator({
  selector: 'md-input-container input'
})
export class MdInput {
  constructor() {

  }
}


@Decorator({
  selector: 'md-input-container'
})
export class MdInputContainer {
}
