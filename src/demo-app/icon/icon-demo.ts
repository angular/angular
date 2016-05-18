import {Component, ViewEncapsulation} from '@angular/core';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon/icon';

@Component({
  moduleId: module.id,
  selector: 'md-icon-demo',
  templateUrl: 'icon-demo.html',
  styleUrls: ['icon-demo.css'],
  directives: [MdIcon],
  viewProviders: [MdIconRegistry],
  encapsulation: ViewEncapsulation.None,
})
export class IconDemo {
  constructor(mdIconRegistry: MdIconRegistry) {
    mdIconRegistry
        .addSvgIcon('thumb-up', '/icon/assets/thumbup-icon.svg')
        .addSvgIconSetInNamespace('core', '/icon/assets/core-icon-set.svg')
        .registerFontClassAlias('fontawesome', 'fa');
  }
}
