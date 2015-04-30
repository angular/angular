import {Directive} from 'angular2/src/core/annotations_impl/annotations';

@Directive({
  selector: 'md-input-container input'
})
export class MdInput {
  constructor() {

  }
}


@Directive({
  selector: 'md-input-container'
})
export class MdInputContainer {
}
