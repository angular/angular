// #docplaster
// #docregion
// #docregion import-ComponentFixtureAutoDetect
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
// #enddocregion import-ComponentFixtureAutoDetect
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BannerComponent} from './banner.component';

describe('BannerComponent (AutoChangeDetect)', () => {
  let comp: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let h1: HTMLElement;

  beforeEach(() => {
    // #docregion auto-detect
    TestBed.configureTestingModule({
      providers: [{provide: ComponentFixtureAutoDetect, useValue: true}],
    });
    // #enddocregion auto-detect
    fixture = TestBed.createComponent(BannerComponent);
    comp = fixture.componentInstance;
    h1 = fixture.nativeElement.querySelector('h1');
  });

  // #docregion auto-detect-tests
  it('should display original title', () => {
    // Hooray! No `fixture.detectChanges()` needed
    expect(h1.textContent).toContain(comp.title);
  });

  it('should still see original title after comp.title change', async () => {
    const oldTitle = comp.title;
    const newTitle = 'Test Title';
    comp.title.set(newTitle);
    // Displayed title is old because Angular didn't yet run change detection
    expect(h1.textContent).toContain(oldTitle);
    await fixture.whenStable();
    expect(h1.textContent).toContain(newTitle);
  });

  it('should display updated title after detectChanges', () => {
    comp.title.set('Test Title');
    fixture.detectChanges(); // detect changes explicitly
    expect(h1.textContent).toContain(comp.title);
  });
  // #enddocregion auto-detect-tests
});
