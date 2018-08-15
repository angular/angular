import {Component, NgModule} from '@angular/core';
import {NG_ASYNC_VALIDATORS} from '@angular/forms';

export const hostBindings = {
  class: 'test-base-comp',
};

const nonExportedStyleUrlsVar = ['./base-component.css'];

@Component({
  selector: 'base-comp',
  template: `
    <span>This is the template.</span>
  `,
  host: hostBindings,
  styleUrls: nonExportedStyleUrlsVar,
  providers: [
    {provide: NG_ASYNC_VALIDATORS, useValue: null},
  ]
})
export class BaseComponentFromOtherFile {}

@NgModule({declarations: [BaseComponentFromOtherFile]})
export class BaseComponentModule {}
