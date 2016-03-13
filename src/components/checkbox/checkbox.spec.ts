import {
  fakeAsync,
  inject,
  tick,
  ComponentFixture,
  TestComponentBuilder,
} from 'angular2/testing';

import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  beforeEach,
} from '../../core/facade/testing';

import {Component, DebugElement, EventEmitter} from 'angular2/core';
import {By} from 'angular2/platform/browser';

import {MdCheckbox} from './checkbox';

// IE11 does not support event constructors, so we need to perform this check.
var BROWSER_SUPPORTS_EVENT_CONSTRUCTORS: boolean = (function() {
  // See: https://github.com/rauschma/event_constructors_check/blob/gh-pages/index.html#L39
  try {
    return new Event('submit', { bubbles: false }).bubbles === false &&
           new Event('submit', { bubbles: true }).bubbles === true;
  } catch (e) {
    return false;
  }
})();

export function main() {
  describe('MdCheckbox', function() {
    var builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], function(tcb: TestComponentBuilder) {
      builder = tcb;
    }));

    it('attaches a class "md-checkbox" to the host element', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el).not.toBeNull();
      }).then(done).catch(done);
    });
    it('attaches a unique id to the host element', function(done: () => void) {
      builder.createAsync(CheckboxMultiController).then(function(fixture) {
        fixture.detectChanges();
        let first = fixture.debugElement.query(By.css('.md-checkbox:first-of-type'));
        let second = fixture.debugElement.query(By.css('.md-checkbox:nth-of-type(2)'));
        expect(first.nativeElement.id).toMatch(/^md\-checkbox\-\d$/g);
        expect(second.nativeElement.id).toMatch(/^md\-checkbox\-\d$/g);
        expect(first.nativeElement.id).not.toEqual(second.nativeElement.id);
      }).then(done).catch(done);
    });

    it('allows clients to provide their own id', function(done: () => void) {
      builder.createAsync(CheckboxCustomIdController).then(function(fixture) {
        fixture.detectChanges();
        let component = fixture.componentInstance;
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.id).toEqual(component.checkboxId);
      }).then(done).catch(done);
    });

    it('creates a label with an id based off the checkbox id', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        let label = el.nativeElement.querySelector('label');
        expect(label.id).toEqual(`${el.nativeElement.id}-label`);
      }).then(done).catch(done);
    });

    it('uses <ng-content></ng-content> for the label markup', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        let label = el.nativeElement.querySelector('label');
        expect(label.innerHTML.trim()).toEqual('<em>my</em> checkbox');
      }).then(done).catch(done);
    });

    it('adds a checkbox role attribute to the host element', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('role')).toEqual('checkbox');
      }).then(done).catch(done);
    });

    it('defaults "aria-checked" to "false" on the host element', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-checked')).toEqual('false');
      }).then(done).catch(done);
    });

    it('defaults "aria-disabled" to "false" on the host element', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-disabled')).toEqual('false');
      }).then(done).catch(done);
    });

    it('defaults tabindex to 0 to the host element', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.tabIndex).toEqual(0);
      }).then(done).catch(done);
    });

    it('allows clients to provide their own tabindex', function(done: () => void) {
      builder.createAsync(CheckboxCustomTabindexController).then(function(fixture) {
        fixture.detectChanges();
        let component = fixture.componentInstance;
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.tabIndex).toEqual(component.checkboxTabindex);
      }).then(done).catch(done);
    });

    it('allows clients to provide an aria-label', function(done: () => void) {
      builder.createAsync(CheckboxCustomArialabelController).then(function(fixture) {
        fixture.detectChanges();
        let component = fixture.componentInstance;
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-label')).toEqual(component.checkboxLabel);
      }).then(done).catch(done);
    });

    it('sets the "aria-labelledby" attribute to the id of the label', function(done: () => void) {
      builder.createAsync(CheckboxController).then(function(fixture) {
        fixture.detectChanges();
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        let label = el.nativeElement.querySelector('label');
        expect(el.nativeElement.getAttribute('aria-labelledby')).toEqual(label.id);
      }).then(done).catch(done);
    });

    describe('when given an "align" input with a value of "end"', function() {
      var fixture: ComponentFixture;

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxEndAlignedController).then(function(f) {
          fixture = f;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      it('sets an "md-checkbox-align-end" class on the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.className).toContain('md-checkbox-align-end');
      });
    });

    describe(`when the checkbox's checked value is set`, function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;
      var changePromise: Promise<boolean>;
      var waitingForChange: boolean;

      function waitForChange(): Promise<boolean> {
        if (waitingForChange) {
          throw new Error('You are already waiting for a change!');
        }
        waitingForChange = true;
        return new Promise(function(resolve, reject) {
          controller.eventProxy.subscribe(resolve, reject);
        }).then(function(val) {
          waitingForChange = false;
          return val;
        });
      }

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;

          changePromise = waitForChange();
          controller.isChecked = true;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      it('adds a "md-checkbox-checked" modifier class to the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.className).toContain('md-checkbox-checked');
      });

      it('sets "aria-checked" to be "true" on the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-checked')).toEqual('true');
      });

      it('emits a change event with the currently checked value', function(done: () => void) {
        changePromise.then(function(isChecked) {
          expect(isChecked).toBe(true);

          let nextChangePromise = waitForChange();
          controller.isChecked = false;
          fixture.detectChanges();

          return nextChangePromise;
        }).then(function(isChecked) {
          expect(isChecked).toBe(false);
        }).then(done).catch(done);
      });
    });

    describe('when the checkbox is indeterminate', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;

          controller.isIndeterminate = true;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      it('adds a "md-checkbox-indeterminate" class to the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.className).toContain('md-checkbox-indeterminate');
      });

      it('sets "aria-checked" to "mixed" on the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-checked')).toEqual('mixed');
      });

      describe('when re-checked to true', function() {
        beforeEach(function() {
          controller.isChecked = true;
          fixture.detectChanges();
        });

        it('removes md-checkbox-indeterminate', function() {
          let el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.className).not.toContain('md-checkbox-indeterminate');
        });
      });

      describe('when re-checked to false', function() {
        beforeEach(function() {
          controller.isChecked = true;
          fixture.detectChanges();

          controller.isIndeterminate = true;
          fixture.detectChanges();

          controller.isChecked = false;
          fixture.detectChanges();
        });

        it('removes md-checkbox-indeterminate', function() {
          let el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.className).not.toContain('md-checkbox-indeterminate');
        });
      });
    });

    describe('when the checkbox is disabled', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;
          fixture.detectChanges();

          controller.isDisabled = true;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      it('adds a "md-checkbox-disabled" class to the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.className).toContain('md-checkbox-disabled');
      });

      it('sets the tabindex to -1 on the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('tabindex')).toEqual('-1');
      });

      it('sets "aria-disabled" to "true" on the host element', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.getAttribute('aria-disabled')).toEqual('true');
      });

      it('restores the previously set tabindex when re-enabled', function(done: () => void) {
        builder.createAsync(CheckboxCustomTabindexController).then(function(f) {
          fixture = f;
          let tabindexController: CheckboxCustomTabindexController = fixture.componentInstance;

          tabindexController.isDisabled = true;
          fixture.detectChanges();
          let el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.getAttribute('tabindex')).toEqual('-1');

          tabindexController.isDisabled = false;
          fixture.detectChanges();
          el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.getAttribute('tabindex')).toEqual(
              String(tabindexController.checkboxTabindex));
        }).then(done).catch(done);
      });

      describe('when the tabindex input is changed while disabled', function() {
        var tabindexController: CheckboxCustomTabindexController;
        var newTabindex: number;

        beforeEach(function(done: () => void) {
          newTabindex = 10;

          builder.createAsync(CheckboxCustomTabindexController).then(function(f) {
            fixture = f;
            tabindexController = fixture.componentInstance;

            tabindexController.isDisabled = true;
            tabindexController.checkboxTabindex = newTabindex;
            fixture.detectChanges();
          }).then(done).catch(done);
        });

        it('keeps the tabindex at -1', function() {
          let el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.getAttribute('tabindex')).toEqual('-1');
        });

        it('uses the newly changed tabindex when re-enabled', function() {
          tabindexController.isDisabled = false;
          fixture.detectChanges();

          let el = fixture.debugElement.query(By.css('.md-checkbox'));
          expect(el.nativeElement.getAttribute('tabindex')).toEqual(String(newTabindex));
        });
      });
    });

    describe('when the checkbox is clicked', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;
      var el: DebugElement;

      function clickCheckbox(): Event {
        return click(el, fixture);
      }

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;

          fixture.detectChanges();
          el = fixture.debugElement.query(By.css('.md-checkbox'));
        }).then(done).catch(done);
      });

      it('toggles the checked value', function() {
        clickCheckbox();
        expect(el.nativeElement.className).toContain('md-checkbox-checked');

        clickCheckbox();
        expect(el.nativeElement.className).not.toContain('md-checkbox-checked');
      });

      describe('when the checkbox is disabled', function() {
        beforeEach(function() {
          controller.isDisabled = true;
          fixture.detectChanges();
        });

        it('stops the click event from propagating', function() {
          let evt = clickCheckbox();
          expect(evt.stopPropagation).toHaveBeenCalled();
        });

        it('does not alter the checked value', function() {
          clickCheckbox();
          expect(el.nativeElement.className).not.toContain('md-checkbox-checked');
        });
      });
    });

    describe('when a spacebar press occurs on the checkbox', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;
      var el: DebugElement;

      function spacePress(): Event {
        return keyup(el, ' ', fixture);
      }

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;

          fixture.detectChanges();
          el = fixture.debugElement.query(By.css('.md-checkbox'));
        }).then(done).catch(done);
      });

      it('toggles the checked value', function() {
        spacePress();
        expect(el.nativeElement.className).toContain('md-checkbox-checked');

        spacePress();
        expect(el.nativeElement.className).not.toContain('md-checkbox-checked');
      });

      describe('when the checkbox is disabled', function() {
        beforeEach(function() {
          controller.isDisabled = true;
          fixture.detectChanges();
        });

        it('stops the click event from propagating', function() {
          let evt = spacePress();
          expect(evt.stopPropagation).toHaveBeenCalled();
        });

        it('does not alter the checked value', function() {
          spacePress();
          expect(el.nativeElement.className).not.toContain('md-checkbox-checked');
        });
      });
    });

    describe('usage as a form control', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxFormcontrolController;

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxFormcontrolController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      // NOTE(traviskaufman): This test is not that elegant, but I have not found a better way
      // to test through ngModel as of now.
      // See: https://github.com/angular/angular/issues/7409
      it('supports ngModel/ngControl', function(done: () => void) {
        var el:  DebugElement;
        var invalidMsg: DebugElement;

        fakeAsync(function() {
          el = fixture.debugElement.query(By.css('.md-checkbox'));
          invalidMsg = fixture.debugElement.query(By.css('#invalid-msg'));

          fixture.detectChanges();
          tick();
          expect(el.nativeElement.className).toContain('ng-untouched');
          expect(el.nativeElement.className).toContain('ng-pristine');
          expect(invalidMsg.nativeElement.hidden).toBe(true);

          controller.model.isChecked = true;
          fixture.detectChanges();
          tick();
          fixture.detectChanges();

          expect(el.nativeElement.className).toContain('md-checkbox-checked');
          expect(el.nativeElement.className).toContain('ng-dirty');
          expect(el.nativeElement.className).toContain('ng-valid');

          var blur: Event;
          if (BROWSER_SUPPORTS_EVENT_CONSTRUCTORS) {
            blur = new Event('blur');
          } else {
            blur = document.createEvent('UIEvent');
            (<UIEvent>blur).initUIEvent('blur', true, true, window, 0);
          }
          el.nativeElement.dispatchEvent(blur);
          fixture.detectChanges();
          tick();
          expect(el.nativeElement.className).toContain('ng-touched');
        })();

        let onceChanged = controller.model.waitForChange();
        click(el, fixture);
        onceChanged.then(function() {
          expect(controller.model.isChecked).toBe(false);
        }).then(done).catch(done);
      });
    });

    describe('applying transition classes', function() {
      var fixture: ComponentFixture;
      var controller: CheckboxController;

      beforeEach(function(done: () => void) {
        builder.createAsync(CheckboxController).then(function(f) {
          fixture = f;
          controller = fixture.componentInstance;
          fixture.detectChanges();
        }).then(done).catch(done);
      });

      it('applies transition classes when going from unchecked <-> checked', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));

        controller.isChecked = true;
        fixture.detectChanges();
        expect(el.nativeElement.className).toContain('md-checkbox-anim-unchecked-checked');

        controller.isChecked = false;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toContain('md-checkbox-anim-unchecked-checked');
        expect(el.nativeElement.className).toContain('md-checkbox-anim-checked-unchecked');
      });

      it('applies transition classes when going from unchecked <-> indeterminate', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));

        controller.isIndeterminate = true;
        fixture.detectChanges();
        expect(el.nativeElement.className).toContain('md-checkbox-anim-unchecked-indeterminate');

        controller.isIndeterminate = false;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toContain(
            'md-checkbox-anim-unchecked-indeterminate');
        expect(el.nativeElement.className).toContain('md-checkbox-anim-indeterminate-unchecked');
      });

      it('applies a transition class when going from checked -> indeterminate', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));

        controller.isChecked = true;
        fixture.detectChanges();

        controller.isIndeterminate = true;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toContain('md-checkbox-anim-unchecked-checked');
        expect(el.nativeElement.className).toContain('md-checkbox-anim-checked-indeterminate');
      });

      it('applies a transition class when going from indeterminate -> checked', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));

        controller.isIndeterminate = true;
        fixture.detectChanges();

        controller.isChecked = true;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toContain(
            'md-checkbox-anim-unchecked-indeterminate');
        expect(el.nativeElement.className).toContain('md-checkbox-anim-indeterminate-checked');
      });

      it('does not apply any transition classes when there is nothing to transition', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));

        controller.isChecked = controller.isChecked;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toMatch(/^md\-checkbox\-anim/g);

        controller.isIndeterminate = controller.isIndeterminate;
        fixture.detectChanges();
        expect(el.nativeElement.className).not.toMatch(/^md\-checkbox\-anim/g);
      });

      it('does not apply any transition classes when the component is initialized', function() {
        let el = fixture.debugElement.query(By.css('.md-checkbox'));
        expect(el.nativeElement.className).not.toMatch(/^md\-checkbox\-anim/g);
      });
    });
  });
}

function click(el: DebugElement, fixture: ComponentFixture) {
  var clickEvent: Event;
  if (BROWSER_SUPPORTS_EVENT_CONSTRUCTORS) {
    clickEvent = new Event('click');
  } else {
    clickEvent = document.createEvent('UIEvent');
    (<UIEvent>clickEvent).initUIEvent('click', true, true, window, 1);
  }
  spyOn(clickEvent, 'stopPropagation').and.callThrough();
  el.nativeElement.dispatchEvent(clickEvent);
  fixture.detectChanges();
  return clickEvent;
}

// TODO(traviskaufman): Reinvestigate implementation of this method once tests in Dart begin to run.
function keyup(el: DebugElement, key: string, fixture: ComponentFixture) {
  var kbdEvent: Event;
  if (BROWSER_SUPPORTS_EVENT_CONSTRUCTORS) {
    kbdEvent = new KeyboardEvent('keyup');
  } else {
    kbdEvent = document.createEvent('Events');
    kbdEvent.initEvent('keyup', true, true);
  }
  // Hack DOM Level 3 Events "key" prop into keyboard event.
  Object.defineProperty(kbdEvent, 'key', {
    value: ' ',
    enumerable: false,
    writable: false,
    configurable: true
  });
  spyOn(kbdEvent, 'stopPropagation').and.callThrough();
  el.nativeElement.dispatchEvent(kbdEvent);
  fixture.detectChanges();
  return kbdEvent;
}

@Component({
  selector: 'checkbox-controller',
  template: `
    <md-checkbox [checked]="isChecked"
                 [indeterminate]="isIndeterminate"
                 [disabled]="isDisabled"
                 (change)="eventProxy.emit($event)">
      <em>my</em> checkbox
    </md-checkbox>
  `,
  directives: [MdCheckbox]
})
class CheckboxController {
  isChecked: boolean = false;
  isIndeterminate: boolean = false;
  isDisabled: boolean = false;
  eventProxy: EventEmitter<boolean> = new EventEmitter<boolean>();
}

@Component({
  selector: 'checkbox-multi-controller',
  template: `
    <md-checkbox></md-checkbox>
    <md-checkbox></md-checkbox>
  `,
  directives: [MdCheckbox]
})
class CheckboxMultiController {}

@Component({
  selector: 'checkbox-custom-id-controller',
  template: `
    <md-checkbox [id]="checkboxId"></md-checkbox>
  `,
  directives: [MdCheckbox]
})
class CheckboxCustomIdController {
  checkboxId: string = 'my-checkbox';
}

@Component({
  selector: 'checkbox-custom-tabindex-controller',
  template: `
    <md-checkbox [tabindex]="checkboxTabindex" [disabled]="isDisabled"></md-checkbox>
  `,
  directives: [MdCheckbox]
})
class CheckboxCustomTabindexController {
  checkboxTabindex: number = 5;
  isDisabled: boolean = false;
}

@Component({
  selector: 'checkbox-custom-arialabel-controller',
  template: `
    <md-checkbox [aria-label]="checkboxLabel"></md-checkbox>
  `,
  directives: [MdCheckbox]
})
class CheckboxCustomArialabelController {
  checkboxLabel: string = 'My awesome checkbox';
}

class FormcontrolModel {
  private _isChecked = false;
  private _changeEmitter = new EventEmitter<boolean>();

  get isChecked(): boolean {
    return this._isChecked;
  }

  set isChecked(isChecked: boolean) {
    let shouldEmitChange = this._isChecked !== isChecked;
    this._isChecked = isChecked;
    if (shouldEmitChange) {
      this._changeEmitter.emit(this._isChecked);
    }
  }

  waitForChange(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let subscription: {unsubscribe: () => void};
      let subscriber = function(isChecked: boolean) {
        subscription.unsubscribe();
        resolve(isChecked);
      };
      subscription = this._changeEmitter.subscribe(subscriber, reject);
    });
  }
}

@Component({
  selector: 'checkbox-formcontrol-controller',
  template: `
    <form>
      <md-checkbox [(ngModel)]="model.isChecked"
                   ngControl="cb" #cb="ngForm">
      </md-checkbox>
      <p id="invalid-msg" [hidden]="cb.valid || cb.pristine">INVALID!</p>
    </form>
  `,
  directives: [MdCheckbox]
})
class CheckboxFormcontrolController {
  model = new FormcontrolModel();
}

@Component({
  selector: 'checkbox-end-aligned-controller',
  template: `<md-checkbox [align]="'end'"></md-checkbox>`,
  directives: [MdCheckbox]
})
class CheckboxEndAlignedController {}
