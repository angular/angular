import {Template} from 'angular2/src/core/annotations/annotations';
import {ViewPort} from 'angular2/src/core/compiler/viewport';
import {isBlank} from 'angular2/src/facade/lang';

@Template({
  selector: '[if]',
  bind: {
    'if': 'condition'
  }
})
export class If {
  viewPort: ViewPort;
  prevCondition: boolean;

  constructor(viewPort: ViewPort) {
    this.viewPort = viewPort;
    this.prevCondition = null;
  }

  set condition(newCondition) {
    if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
      this.prevCondition = true;
      this.viewPort.create();
    } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
      this.prevCondition = false;
      this.viewPort.clear();
    }
  }
}
