import {Decorator} from 'angular2/src/core/annotations_impl/annotations';

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
