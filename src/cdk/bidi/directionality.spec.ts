import {async, fakeAsync, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {BidiModule, Directionality, Dir, Direction, DIR_DOCUMENT} from './index';

describe('Directionality', () => {
  let fakeDocument: FakeDocument;

  beforeEach(async(() => {
    fakeDocument = {body: {}, documentElement: {}};

    TestBed.configureTestingModule({
      imports: [BidiModule],
      declarations: [
        ElementWithDir,
        ElementWithPredefinedAutoDir,
        InjectsDirectionality,
        ElementWithPredefinedUppercaseDir,
      ],
      providers: [{provide: DIR_DOCUMENT, useFactory: () => fakeDocument}],
    }).compileComponents();
  }));

  describe('Service', () => {
    it('should read dir from the html element if not specified on the body', () => {
      fakeDocument.documentElement.dir = 'rtl';

      const fixture = TestBed.createComponent(InjectsDirectionality);
      const testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should read dir from the body even it is also specified on the html element', () => {
      fakeDocument.documentElement.dir = 'ltr';
      fakeDocument.body.dir = 'rtl';

      const fixture = TestBed.createComponent(InjectsDirectionality);
      const testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('rtl');
    });

    it('should default to ltr if nothing is specified on either body or the html element', () => {
      const fixture = TestBed.createComponent(InjectsDirectionality);
      const testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('ltr');
    });

    it('should complete the `change` stream on destroy', () => {
      const fixture = TestBed.createComponent(InjectsDirectionality);
      const spy = jasmine.createSpy('complete spy');
      const subscription =
          fixture.componentInstance.dir.change.subscribe(undefined, undefined, spy);

      fixture.componentInstance.dir.ngOnDestroy();
      expect(spy).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should default to ltr if an invalid direction is set on the body', () => {
      fakeDocument.body.dir = 'not-valid';

      const fixture = TestBed.createComponent(InjectsDirectionality);
      const testComponent = fixture.debugElement.componentInstance;

      expect(testComponent.dir.value).toBe('ltr');
    });

  });

  describe('Dir directive', () => {
    it('should provide itself as Directionality', () => {
      const fixture = TestBed.createComponent(ElementWithDir);
      const injectedDirectionality =
        fixture.debugElement.query(By.directive(InjectsDirectionality)).componentInstance.dir;

      fixture.detectChanges();

      expect(injectedDirectionality.value).toBe('rtl');
    });

    it('should emit a change event when the value changes', fakeAsync(() => {
      const fixture = TestBed.createComponent(ElementWithDir);
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

    it('should default to ltr if an invalid value is passed in', () => {
      const fixture = TestBed.createComponent(ElementWithDir);

      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('rtl');

      fixture.componentInstance.direction = 'not-valid';
      fixture.detectChanges();
      expect(fixture.componentInstance.dir.value).toBe('ltr');
    });

    it('should preserve the consumer-provided `dir` attribute while ' +
      'normalizing the directive value', () => {
        const fixture = TestBed.createComponent(ElementWithPredefinedAutoDir);
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');

        expect(element.getAttribute('dir')).toBe('auto');
        expect(fixture.componentInstance.dir.value).toBe('ltr');
      });

    it('should be case-insensitive', () => {
      const fixture = TestBed.createComponent(ElementWithPredefinedUppercaseDir);
      fixture.detectChanges();

      expect(fixture.componentInstance.dir.value).toBe('rtl');
    });

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
  @ViewChild(Dir) dir: Dir;
  direction = 'rtl';
  changeCount = 0;
}

@Component({
  template: '<div dir="auto"></div>'
})
class ElementWithPredefinedAutoDir {
  @ViewChild(Dir) dir: Dir;
}

@Component({
  template: '<div dir="RTL"></div>'
})
class ElementWithPredefinedUppercaseDir {
  @ViewChild(Dir) dir: Dir;
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
