import {Viewport} from 'angular2/src/core/annotations/annotations';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {isBlank} from 'angular2/src/facade/lang';

@Viewport({
  selector: '[if]',
  bind: {
    'condition': 'if'
  }
})
export class If {
  viewContainer: ViewContainer;
  prevCondition: boolean;

  constructor(viewContainer: ViewContainer) {
    this.viewContainer = viewContainer;
    this.prevCondition = null;
  }

  set condition(newCondition) {
    if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
      this.prevCondition = true;
      this.viewContainer.create();
    } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
      this.prevCondition = false;
      this.viewContainer.clear();
    }
  }
}
