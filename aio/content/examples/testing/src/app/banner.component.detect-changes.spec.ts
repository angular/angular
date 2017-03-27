// #docplaster
// #docregion
// #docregion import-async
import { async } from '@angular/core/testing';
// #enddocregion import-async
// #docregion import-ComponentFixtureAutoDetect
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
// #enddocregion import-ComponentFixtureAutoDetect
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';

import { BannerComponent } from './banner.component';

describe('BannerComponent (AutoChangeDetect)', () => {
  let comp:    BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let de:      DebugElement;
  let el:      HTMLElement;

  beforeEach(async(() => {
    // #docregion auto-detect
    TestBed.configureTestingModule({
      declarations: [ BannerComponent ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    })
    // #enddocregion auto-detect
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('h1'));
    el = de.nativeElement;
  });

  // #docregion auto-detect-tests
  it('should display original title', () => {
    // Hooray! No `fixture.detectChanges()` needed
    expect(el.textContent).toContain(comp.title);
  });

  it('should still see original title after comp.title change', () => {
    const oldTitle = comp.title;
    comp.title = 'Test Title';
    // Displayed title is old because Angular didn't hear the change :(
    expect(el.textContent).toContain(oldTitle);
  });

  it('should display updated title after detectChanges', () => {
    comp.title = 'Test Title';
    fixture.detectChanges(); // detect changes explicitly
    expect(el.textContent).toContain(comp.title);
  });
  // #enddocregion auto-detect-tests
});
