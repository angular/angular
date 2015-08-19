import {Component, BaseView, ViewEncapsulation} from 'angular2/angular2';

@Component({selector: 'md-progress-circular'})
@BaseView({
  templateUrl: 'package:angular2_material/src/components/progress-circular/progress_circular.html',
  encapsulation: ViewEncapsulation.NONE
})
export class MdProgressCircular {
  constructor() {}
}
