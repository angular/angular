// #docplaster
// #docregion import-async
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// #enddocregion import-async
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BannerComponent } from './banner-external.component';

describe('BannerComponent (external files)', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let h1: HTMLElement;

  describe('Two beforeEach', () => {
    // #docregion async-before-each
    beforeEach(waitForAsync(() => {
      TestBed
          .configureTestingModule({
            declarations: [BannerComponent],
          })
          .compileComponents();  // compile template and css
    }));
    // #enddocregion async-before-each

    // synchronous beforeEach
    // #docregion sync-before-each
    beforeEach(() => {
      fixture = TestBed.createComponent(BannerComponent);
      component = fixture.componentInstance;  // BannerComponent test instance
      h1 = fixture.nativeElement.querySelector('h1');
    });
    // #enddocregion sync-before-each

    tests();
  });

  describe('One beforeEach', () => {
    // #docregion one-before-each
    beforeEach(waitForAsync(() => {
      TestBed
          .configureTestingModule({
            declarations: [BannerComponent],
          })
          .compileComponents()
          .then(() => {
            fixture = TestBed.createComponent(BannerComponent);
            component = fixture.componentInstance;
            h1 = fixture.nativeElement.querySelector('h1');
          });
    }));
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
