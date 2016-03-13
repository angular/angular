import {Component} from 'angular2/core';
import {
  inject,
  TestComponentBuilder
} from 'angular2/testing';

import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  beforeEach,
} from '../../core/facade/testing';
import {By} from 'angular2/platform/browser';
import {MdToolbar} from './toolbar';

export function main() {
  describe('MdToolbar', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));

    it('should apply class based on color attribute', (done: () => void) => {
      return builder.createAsync(TestApp).then((fixture) => {
        let testComponent = fixture.debugElement.componentInstance;
        let toolbarDebugElement = fixture.debugElement.query(By.css('md-toolbar'));

        testComponent.toolbarColor = 'primary';
        fixture.detectChanges();

        expect(toolbarDebugElement.nativeElement.classList.contains('md-primary')).toBe(true);

        testComponent.toolbarColor = 'accent';
        fixture.detectChanges();

        expect(toolbarDebugElement.nativeElement.classList.contains('md-accent')).toBe(true);

        testComponent.toolbarColor = 'warn';
        fixture.detectChanges();

        expect(toolbarDebugElement.nativeElement.classList.contains('md-warn')).toBe(true);

        done();
      });
    });

  });
}

@Component({
  selector: 'test-app',
  template: `
    <md-toolbar [color]="toolbarColor">
      <span>Test Toolbar</span>
    </md-toolbar>
  `,
  directives: [MdToolbar]
})
class TestApp {
  toolbarColor: string;
}
