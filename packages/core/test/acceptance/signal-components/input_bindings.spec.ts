import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, input} from '@angular/core';
import {TestBed} from '@angular/core/testing';


if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('Signal component inputs', () => {
  describe('both', () => {
    it('should support binding to literal strings', () => {
      @Component({
        selector: 'print',
        signals: true,
        template: `num()`,
        standalone: true,
      })
      class Print {
        num = input(0);
      }

      @Component({signals: true, template: `<print [num]="3">`})
      class App {
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('3');
    });
  });
})
