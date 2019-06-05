import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'component-harness-e2e',
  template: `<test-main></test-main>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentHarnessE2e {}
