import {Template} from 'core/src/annotations/annotations';
import {ViewPort} from 'core/src/compiler/viewport';
import {isBlank} from 'facade/src/lang';

@Template({
  selector: '[ng-if]',
  bind: {
    'ng-if': 'condition'
  }
})
export class NgIf {
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
