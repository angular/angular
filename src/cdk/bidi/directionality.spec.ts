import {async, fakeAsync, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BidiModule, Directionality, Direction, DIR_DOCUMENT} from './index';

describe('Directionality', () => {
  let fakeDocument: FakeDocument;

  beforeEach(async(() => {
    fakeDocument = {body: {}, documentElement: {}};

    TestBed.configureTestingModule({
      imports: [BidiModule],
      declarations: [ElementWithDir, InjectsDirectionality],
      providers: [{provide: DIR_DOCUMENT, useFactory: () => fakeDocument}],
    }).compileComponents();
  }));

  describe('Service', () => {
    it('should read dir from the html element if not specified on the body', () => {
      fakeDocument.documentElement.dir = 'rtl';

      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should read dir from the body even it is also specified on the html element', () => {
      fakeDocument.documentElement.dir = 'ltr';
      fakeDocument.body.dir = 'rtl';

      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should default to ltr if nothing is specified on either body or the html element', () => {
      let fixture = TestBed.createComponent(InjectsDirectionality);
      let testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('ltr');
    });
  });

  describe('Dir directive', () => {
    it('should provide itself as Directionality', () => {
      let fixture = TestBed.createComponent(ElementWithDir);
      const injectedDirectionality =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;

      fixture.detectChanges();

      expect(injectedDirectionality.value).toBe('rtl');
    });

    it('should emit a change event when the value changes', fakeAsync(() => {
      let fixture = TestBed.createComponent(ElementWithDir);
      const injectedDirectionality =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;

      fixture.detectChanges();

      let direction = injectedDirectionality.value;
      injectedDirectionality.change.subscribe((dir: Direction) => { direction = dir; });

      expect(direction).toBe('rtl');
      expect(injectedDirectionality.value).toBe('rtl');
      expect(fixture.componentInstance.changeCount).toBe(0);

      fixture.componentInstance.direction = 'ltr';

      fixture.detectChanges();

      expect(direction).toBe('ltr');
      expect(injectedDirectionality.value).toBe('ltr');
      expect(fixture.componentInstance.changeCount).toBe(1);
    }));

    it('should complete the change stream on destroy', fakeAsync(() => {
      const fixture = TestBed.createComponent(ElementWithDir);
      const dir =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;
      const spy = jasmine.createSpy('complete spy');
      const subscription = dir.change.subscribe(undefined, undefined, spy);

      fixture.destroy();
      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    }));

  });
});


@Component({
  template: `
    <div [dir]="direction" (dirChange)="changeCount = changeCount + 1">
      <injects-directionality></injects-directionality>
    </div>
  `
})
class ElementWithDir {
  direction = 'rtl';
  changeCount = 0;
}

/** Test component with Dir directive. */
@Component({
  selector: 'injects-directionality',
  template: `<div></div>`
})
class InjectsDirectionality {
  constructor(public dir: Directionality) { }
}

interface FakeDocument {
  documentElement: {dir?: string};
  body: {dir?: string};
}
