// #docplaster
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BannerComponent} from './banner-external.component';

describe('BannerComponent (external files)', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let h1: HTMLElement;

  describe('setup that may fail', () => {
    // #docregion setup-may-fail
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BannerComponent],
      }); // missing call to compileComponents()
      fixture = TestBed.createComponent(BannerComponent);
    });
    // #enddocregion setup-may-fail

    it('should create', () => {
      expect(fixture.componentInstance).toBeDefined();
    });
  });

  describe('Two beforeEach', () => {
    // #docregion async-before-each
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BannerComponent],
      }); // compile template and css
    });
    // #enddocregion async-before-each

    // synchronous beforeEach
    // #docregion sync-before-each
    beforeEach(() => {
      fixture = TestBed.createComponent(BannerComponent);
      component = fixture.componentInstance; // BannerComponent test instance
      h1 = fixture.nativeElement.querySelector('h1');
    });
    // #enddocregion sync-before-each

    tests();
  });

  describe('One beforeEach', () => {
    // #docregion one-before-each
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BannerComponent],
      });
      fixture = TestBed.createComponent(BannerComponent);
      component = fixture.componentInstance;
      h1 = fixture.nativeElement.querySelector('h1');
    });
    // #enddocregion one-before-each

    tests();
  });

  function tests() {
    it('no title in the DOM until manually call `detectChanges`', () => {
      expect(h1.textContent).toEqual('');
    });

    it('should display original title', () => {
      fixture.detectChanges();
      expect(h1.textContent).toContain(component.title);
    });

    it('should display a different test title', () => {
      component.title = 'Test Title';
      fixture.detectChanges();
      expect(h1.textContent).toContain('Test Title');
    });
  }
});
