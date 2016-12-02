import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {MdCheckboxModule} from '../../checkbox/checkbox';
import {NoConflictStyleCompatibilityMode} from './no-conflict-mode';


describe('Style compatibility', () => {

  describe('in default mode', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        // Specifically do *not* directly import the DefaultStyleCompatibilityModeModule
        // to ensure that it is the default behavior.
        imports: [MdCheckboxModule.forRoot()],
        declarations: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
      });

      TestBed.compileComponents();
    }));

    it('should throw an error when trying to use the "mat-" prefix', () => {
      expect(() => {
        TestBed.createComponent(ComponentWithMatCheckbox);
      }).toThrowError(/The "mat-" prefix cannot be used out of ng-material v1 compatibility mode/);
    });
  });

  describe('in no-conflict mode', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [MdCheckboxModule.forRoot(), NoConflictStyleCompatibilityMode],
        declarations: [ComponentWithMdCheckbox, ComponentWithMatCheckbox],
      });

      TestBed.compileComponents();
    }));

    it('should not throw an error when trying to use the "mat-" prefix', () => {
      TestBed.createComponent(ComponentWithMatCheckbox);
    });

    it('should throw an error when trying to use the "md-" prefix', () => {
      expect(() => {
        TestBed.createComponent(ComponentWithMdCheckbox);
      }).toThrowError(/The "md-" prefix cannot be used in ng-material v1 compatibility mode/);
    });
  });
});


@Component({ template: `<md-checkbox>Hungry</md-checkbox>` })
class ComponentWithMdCheckbox { }

@Component({ template: `<mat-checkbox>Hungry</mat-checkbox>` })
class ComponentWithMatCheckbox { }
