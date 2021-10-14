import {AfterViewInit, Component, ElementRef, Type, ViewChild, Provider} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  A11yModule,
  ConfigurableFocusTrap,
  ConfigurableFocusTrapFactory,
  FOCUS_TRAP_INERT_STRATEGY,
  FocusTrap,
  FocusTrapInertStrategy,
} from '../index';
import {FocusTrapManager} from './focus-trap-manager';

describe('ConfigurableFocusTrap', () => {
  let providers: Provider[];

  describe('with FocusTrapInertStrategy', () => {
    let mockInertStrategy: FocusTrapInertStrategy;

    beforeEach(() => {
      mockInertStrategy = new MockFocusTrapInertStrategy();
      providers = [{provide: FOCUS_TRAP_INERT_STRATEGY, useValue: mockInertStrategy}];
    });

    it('Calls preventFocus when it is created', () => {
      spyOn(mockInertStrategy, 'preventFocus');
      spyOn(mockInertStrategy, 'allowFocus');

      const fixture = createComponent(SimpleFocusTrap, providers);
      fixture.detectChanges();

      expect(mockInertStrategy.preventFocus).toHaveBeenCalledTimes(1);
      expect(mockInertStrategy.allowFocus).not.toHaveBeenCalled();
    });

    it('Calls preventFocus when it is enabled', () => {
      spyOn(mockInertStrategy, 'preventFocus');

      const fixture = createComponent(SimpleFocusTrap, providers);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();

      componentInstance.focusTrap.enabled = true;

      expect(mockInertStrategy.preventFocus).toHaveBeenCalledTimes(2);
    });

    it('Calls allowFocus when it is disabled', () => {
      spyOn(mockInertStrategy, 'allowFocus');

      const fixture = createComponent(SimpleFocusTrap, providers);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();

      componentInstance.focusTrap.enabled = false;

      expect(mockInertStrategy.allowFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('with FocusTrapManager', () => {
    let manager: FocusTrapManager;

    beforeEach(() => {
      manager = new FocusTrapManager();
      providers = [{provide: FocusTrapManager, useValue: manager}];
    });

    it('Registers when it is created', () => {
      spyOn(manager, 'register');

      const fixture = createComponent(SimpleFocusTrap, providers);
      fixture.detectChanges();

      expect(manager.register).toHaveBeenCalledTimes(1);
    });

    it('Deregisters when it is disabled', () => {
      spyOn(manager, 'deregister');

      const fixture = createComponent(SimpleFocusTrap, providers);
      const componentInstance = fixture.componentInstance;
      fixture.detectChanges();

      componentInstance.focusTrap.enabled = false;

      expect(manager.deregister).toHaveBeenCalledTimes(1);
    });
  });
});

function createComponent<T>(
  componentType: Type<T>,
  providers: Provider[] = [],
): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [A11yModule],
    declarations: [componentType],
    providers: providers,
  }).compileComponents();

  return TestBed.createComponent<T>(componentType);
}

@Component({
  template: `
    <div #focusTrapElement>
      <input>
      <button>SAVE</button>
    </div>
    `,
})
class SimpleFocusTrap implements AfterViewInit {
  @ViewChild('focusTrapElement') focusTrapElement!: ElementRef;

  focusTrap: ConfigurableFocusTrap;

  constructor(private _focusTrapFactory: ConfigurableFocusTrapFactory) {}

  ngAfterViewInit() {
    this.focusTrap = this._focusTrapFactory.create(this.focusTrapElement.nativeElement);
  }
}

class MockFocusTrapInertStrategy implements FocusTrapInertStrategy {
  preventFocus(focusTrap: FocusTrap) {}

  allowFocus(focusTrap: FocusTrap) {}
}
