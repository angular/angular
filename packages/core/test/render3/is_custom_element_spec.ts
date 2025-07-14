/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

describe('isCustomElement', () => {
  describe('NgModule', () => {
    it('should allow custom elements using isCustomElement function', () => {
      @Component({
        template: `<my-custom-element></my-custom-element>`,
      })
      class TestComponent {}

      @NgModule({
        declarations: [TestComponent],
        isCustomElement: (tag) => tag.includes('-'),
      })
      class TestModule {}

      expect(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
        });
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should reject unknown elements when isCustomElement returns false', () => {
      @Component({
        template: `<unknown-element></unknown-element>`,
      })
      class TestComponent {}

      @NgModule({
        declarations: [TestComponent],
        isCustomElement: (tag) => tag.startsWith('my-'),
      })
      class TestModule {}

      // Should log an error but not throw in non-strict mode
      const consoleErrorSpy = spyOn(console, 'error');
      
      TestBed.configureTestingModule({
        imports: [TestModule],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/is not a known element/)
      );
    });

    it('should work with complex custom element detection logic', () => {
      @Component({
        template: `
          <polymer-element></polymer-element>
          <lit-element></lit-element>
          <regular-element></regular-element>
        `,
      })
      class TestComponent {}

      @NgModule({
        declarations: [TestComponent],
        isCustomElement: (tag) => {
          return tag.startsWith('polymer-') || tag.startsWith('lit-');
        },
      })
      class TestModule {}

      const consoleErrorSpy = spyOn(console, 'error');
      
      TestBed.configureTestingModule({
        imports: [TestModule],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Should only error for regular-element
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/regular-element.*is not a known element/)
      );
    });
  });

  describe('Standalone Component', () => {
    it('should allow custom elements using isCustomElement function', () => {
      @Component({
        standalone: true,
        template: `<my-custom-element></my-custom-element>`,
        isCustomElement: (tag) => tag.includes('-'),
      })
      class TestComponent {}

      expect(() => {
        TestBed.configureTestingModule({
          imports: [TestComponent],
        });
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should reject unknown elements when isCustomElement returns false', () => {
      @Component({
        standalone: true,
        template: `<unknown-element></unknown-element>`,
        isCustomElement: (tag) => tag.startsWith('my-'),
      })
      class TestComponent {}

      const consoleErrorSpy = spyOn(console, 'error');
      
      TestBed.configureTestingModule({
        imports: [TestComponent],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/is not a known element/)
      );
    });

    it('should throw error when isCustomElement is used on non-standalone component', () => {
      expect(() => {
        @Component({
          template: `<div></div>`,
          isCustomElement: (tag) => tag.includes('-'),
        })
        class TestComponent {}

        @NgModule({
          declarations: [TestComponent],
        })
        class TestModule {}
      }).toThrow(/isCustomElement.*only valid on a component that is standalone/);
    });
  });

  describe('Property validation', () => {
    it('should allow properties on custom elements defined by isCustomElement', () => {
      @Component({
        standalone: true,
        template: `<my-custom-element [customProp]="value"></my-custom-element>`,
        isCustomElement: (tag) => tag.includes('-'),
      })
      class TestComponent {
        value = 'test';
      }

      const consoleErrorSpy = spyOn(console, 'error');
      
      TestBed.configureTestingModule({
        imports: [TestComponent],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      // Should not error about unknown property
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should error for properties on non-custom elements', () => {
      @Component({
        standalone: true,
        template: `<div [customProp]="value"></div>`,
        isCustomElement: (tag) => tag.includes('-'),
      })
      class TestComponent {
        value = 'test';
      }

      const consoleErrorSpy = spyOn(console, 'error');
      
      TestBed.configureTestingModule({
        imports: [TestComponent],
      });
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/Can't bind to 'customProp'/)
      );
    });
  });

  describe('Integration with CUSTOM_ELEMENTS_SCHEMA', () => {
    it('should work alongside CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        standalone: true,
        template: `
          <my-custom-element></my-custom-element>
          <other-element></other-element>
        `,
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        isCustomElement: (tag) => tag.startsWith('my-'),
      })
      class TestComponent {}

      expect(() => {
        TestBed.configureTestingModule({
          imports: [TestComponent],
        });
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should prioritize isCustomElement over CUSTOM_ELEMENTS_SCHEMA logic', () => {
      @Component({
        standalone: true,
        template: `<non-hyphenated-element></non-hyphenated-element>`,
        isCustomElement: (tag) => tag === 'non-hyphenated-element',
      })
      class TestComponent {}

      expect(() => {
        TestBed.configureTestingModule({
          imports: [TestComponent],
        });
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
