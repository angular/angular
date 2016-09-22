import {Component, ViewEncapsulation} from '@angular/core';
import {MdIconRegistry} from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'md-icon-demo',
  templateUrl: 'icon-demo.html',
  styleUrls: ['icon-demo.css'],
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
