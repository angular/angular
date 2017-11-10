import {Direction, Directionality} from '@angular/cdk/bidi';
import {PortalModule, TemplatePortal} from '@angular/cdk/portal';
import {CommonModule} from '@angular/common';
import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatRippleModule} from '@angular/material/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabBody, MatTabBodyPortal} from './tab-body';


describe('MatTabBody', () => {
  let dir: Direction = 'ltr';

  beforeEach(async(() => {
    dir = 'ltr';
    TestBed.configureTestingModule({
      imports: [CommonModule, PortalModule, MatRippleModule, NoopAnimationsModule],
      declarations: [
        MatTabBody,
        MatTabBodyPortal,
        SimpleTabBodyApp,
      ],
      providers: [
        {provide: Directionality, useFactory: () => ({value: dir})}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('when initialized as center', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    describe('in LTR direction', () => {
      beforeEach(() => {
        dir = 'ltr';
        fixture = TestBed.createComponent(SimpleTabBodyApp);
      });

      it('should be center position without origin', () => {
        fixture.componentInstance.position = 0;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('center');
      });

      it('should be left-origin-center position with negative or zero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 0;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('left-origin-center');
      });

      it('should be right-origin-center position with positive nonzero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('right-origin-center');
      });
    });

    describe('in RTL direction', () => {
      beforeEach(() => {
        dir = 'rtl';
        fixture = TestBed.createComponent(SimpleTabBodyApp);
      });

      it('should be right-origin-center position with negative or zero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 0;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('right-origin-center');
      });

      it('should be left-origin-center position with positive nonzero origin', () => {
        fixture.componentInstance.position = 0;
        fixture.componentInstance.origin = 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody._position).toBe('left-origin-center');
      });
    });
  });

  describe('should properly set the position in LTR', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    beforeEach(() => {
      dir = 'ltr';
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.detectChanges();
    });

    it('to be left position with negative position', () => {
      fixture.componentInstance.position = -1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('left');
    });

    it('to be center position with zero position', () => {
      fixture.componentInstance.position = 0;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    it('to be left position with positive position', () => {
      fixture.componentInstance.position = 1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('right');
    });
  });

  describe('should properly set the position in RTL', () => {
    let fixture: ComponentFixture<SimpleTabBodyApp>;

    beforeEach(() => {
      dir = 'rtl';
      fixture = TestBed.createComponent(SimpleTabBodyApp);
      fixture.detectChanges();
    });

    it('to be right position with negative position', () => {
      fixture.componentInstance.position = -1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('right');
    });

    it('to be center position with zero position', () => {
      fixture.componentInstance.position = 0;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('center');
    });

    it('to be left position with positive position', () => {
      fixture.componentInstance.position = 1;
      fixture.detectChanges();

      expect(fixture.componentInstance.tabBody._position).toBe('left');
    });
  });
});


@Component({
  template: `
    <ng-template>Tab Body Content</ng-template>
    <mat-tab-body [content]="content" [position]="position" [origin]="origin"></mat-tab-body>
  `
})
class SimpleTabBodyApp {
  content: TemplatePortal<any>;
  position: number;
  origin: number;

  @ViewChild(MatTabBody) tabBody: MatTabBody;
  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) { }

  ngAfterContentInit() {
    this.content = new TemplatePortal(this.template, this._viewContainerRef);
  }
}
