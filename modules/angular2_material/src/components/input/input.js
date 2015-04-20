import {Decorator} from 'angular2/angular2';

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
