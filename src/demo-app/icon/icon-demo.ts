import {Component, ViewEncapsulation} from 'angular2/core';
import {MdIcon} from '../../components/icon/icon';
import {MdIconRegistry} from '../../components/icon/icon-registry';

@Component({
  selector: 'md-icon-demo',
  templateUrl: 'demo-app/icon/icon-demo.html',
  styleUrls: ['demo-app/icon/icon-demo.css'],
  directives: [MdIcon],
  viewProviders: [MdIconRegistry],
  encapsulation: ViewEncapsulation.None,
})
export class IconDemo {
  constructor(mdIconRegistry: MdIconRegistry) {
    mdIconRegistry
        .addSvgIcon('thumb-up', '/demo-app/icon/assets/thumbup-icon.svg')
        .addSvgIconSetInNamespace('core', '/demo-app/icon/assets/core-icon-set.svg')
        .registerFontClassAlias('fontawesome', 'fa');
  }
}
