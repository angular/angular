// #docplaster
// #docregion
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { BannerComponent } from './banner.component';

describe('BannerComponent (inline template)', () => {
  // #docregion setup
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let h1: HTMLElement;

  // #docregion configure-and-create
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerComponent ],
    });
    fixture = TestBed.createComponent(BannerComponent);
    // #enddocregion configure-and-create
    component = fixture.componentInstance; // BannerComponent test instance
    h1 = fixture.nativeElement.querySelector('h1');
    // #docregion configure-and-create
  });
  // #enddocregion setup, configure-and-create

  // #docregion test-w-o-detect-changes
  it('no title in the DOM after createComponent()', () => {
    expect(h1.textContent).toEqual('');
  });
  // #enddocregion test-w-o-detect-changes

  // #docregion expect-h1-default-v1
  it('should display original title', () => {
    // #enddocregion expect-h1-default-v1
    fixture.detectChanges();
    // #docregion expect-h1-default-v1
    expect(h1.textContent).toContain(component.title);
  });
  // #enddocregion expect-h1-default-v1

  // #docregion expect-h1-default
  it('should display original title after detectChanges()', () => {
    fixture.detectChanges();
    expect(h1.textContent).toContain(component.title);
  });
  // #enddocregion expect-h1-default

  // #docregion after-change
  it('should display a different test title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    expect(h1.textContent).toContain('Test Title');
  });
  // #enddocregion after-change
});
