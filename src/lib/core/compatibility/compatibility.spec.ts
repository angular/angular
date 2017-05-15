import {Component, NgModule} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {MdCheckboxModule} from '../../checkbox/index';
import {
  NoConflictStyleCompatibilityMode,
  MAT_ELEMENTS_SELECTOR,
  MD_ELEMENTS_SELECTOR,
  getMdCompatibilityInvalidPrefixError,
} from './compatibility';
import {wrappedErrorMessage} from '../testing/wrapped-error-message';


describe('Style compatibility', () => {

  describe('selectors', () => {
    it('should have the same selectors in the same order for compatibility mode', () => {
      expect(MAT_ELEMENTS_SELECTOR.replace(/(\s|\[)mat/g, '$1md').trim())
          .toBe(MD_ELEMENTS_SELECTOR.trim());
      expect(MD_ELEMENTS_SELECTOR.replace(/(\s|\[)md/g, '$1mat').trim())
          .toBe(MAT_ELEMENTS_SELECTOR.trim());
    });
  });

  describe('in default mode', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        // Specifically do *not* directly import the DefaultStyleCompatibilityModeModule
        // to ensure that it is the default behavior.
        imports: [MdCheckboxModule],
        declarations: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
      });

      TestBed.compileComponents();
    }));

    it('should throw an error when trying to use the "mat-" prefix', () => {
      const expectedError = getMdCompatibilityInvalidPrefixError('mat', 'mat-checkbox');

      expect(() => {
        TestBed.createComponent(ComponentWithMatCheckbox);
      }).toThrowError(wrappedErrorMessage(expectedError));
    });
  });

  describe('in no-conflict mode', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MdCheckboxModule, NoConflictStyleCompatibilityMode],
        declarations: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
      });

      TestBed.compileComponents();
    }));

    it('should not throw an error when trying to use the "mat-" prefix', () => {
      TestBed.createComponent(ComponentWithMatCheckbox);
    });

    it('should throw an error when trying to use the "md-" prefix', () => {
      const expectedError = getMdCompatibilityInvalidPrefixError('md', 'md-checkbox');

      expect(() => {
        TestBed.createComponent(ComponentWithMdCheckbox);
      }).toThrowError(wrappedErrorMessage(expectedError));
    });
  });

  describe('with no-conflict mode at root and component module imported in app sub-module', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [TestAppSubModule, NoConflictStyleCompatibilityMode],
      });

      TestBed.compileComponents();
    }));

    it('should throw an error when using the "md-" prefix', () => {
      const expectedError = getMdCompatibilityInvalidPrefixError('md', 'md-checkbox');

      expect(() => {
        TestBed.createComponent(ComponentWithMdCheckbox);
      }).toThrowError(wrappedErrorMessage(expectedError));
    });

    it('should not throw an error when using the "mat-" prefix', () => {
      TestBed.createComponent(ComponentWithMatCheckbox);
    });
  });
});


@Component({ template: `<md-checkbox>Hungry</md-checkbox>` })
class ComponentWithMdCheckbox { }

@Component({ template: `<mat-checkbox>Hungry</mat-checkbox>` })
class ComponentWithMatCheckbox { }


@NgModule({
  imports: [MdCheckboxModule],
  exports: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
  declarations: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
})
export class TestAppSubModule {}
