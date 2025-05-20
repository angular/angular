// #docplaster
// #docregion import-debug-element
import {DebugElement} from '@angular/core';
// #enddocregion import-debug-element
// #docregion v1
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

// #enddocregion v1
// #docregion import-by
import {By} from '@angular/platform-browser';
// #enddocregion import-by
import {BannerComponent} from './banner-initial.component';

/*
// #docregion v1
import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
// #enddocregion v1
*/
describe('BannerComponent (initial CLI generated)', () => {
  // #docregion v1
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({imports: [BannerComponent]});
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
// #enddocregion v1

// #docregion v2
describe('BannerComponent (minimal)', () => {
  it('should create', () => {
    // #docregion configureTestingModule
    TestBed.configureTestingModule({imports: [BannerComponent]});
    // #enddocregion configureTestingModule
    // #docregion createComponent
    const fixture = TestBed.createComponent(BannerComponent);
    // #enddocregion createComponent
    // #docregion componentInstance
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    // #enddocregion componentInstance
  });
});
// #enddocregion v2

// #docregion v3
describe('BannerComponent (with beforeEach)', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [BannerComponent]});
    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  // #enddocregion v3

  // #docregion v4-test-2
  it('should contain "banner works!"', () => {
    const bannerElement: HTMLElement = fixture.nativeElement;
    expect(bannerElement.textContent).toContain('banner works!');
  });
  // #enddocregion v4-test-2

  // #docregion v4-test-3
  it('should have <p> with "banner works!"', () => {
    // #docregion nativeElement
    const bannerElement: HTMLElement = fixture.nativeElement;
    // #enddocregion nativeElement
    const p = bannerElement.querySelector('p')!;
    expect(p.textContent).toEqual('banner works!');
  });
  // #enddocregion v4-test-3

  // #docregion v4-test-4
  it('should find the <p> with fixture.debugElement.nativeElement', () => {
    // #docregion debugElement-nativeElement
    const bannerDe: DebugElement = fixture.debugElement;
    const bannerEl: HTMLElement = bannerDe.nativeElement;
    // #enddocregion debugElement-nativeElement
    const p = bannerEl.querySelector('p')!;
    expect(p.textContent).toEqual('banner works!');
  });
  // #enddocregion v4-test-4

  // #docregion v4-test-5
  it('should find the <p> with fixture.debugElement.query(By.css)', () => {
    const bannerDe: DebugElement = fixture.debugElement;
    const paragraphDe = bannerDe.query(By.css('p'));
    const p: HTMLElement = paragraphDe.nativeElement;
    expect(p.textContent).toEqual('banner works!');
  });
  // #enddocregion v4-test-5
  // #docregion v3
});
// #enddocregion v3
