// #docplaster
// #docregion
// #docregion import-async
import { async } from '@angular/core/testing';
// #enddocregion import-async
// #docregion import-ComponentFixtureAutoDetect
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
// #enddocregion import-ComponentFixtureAutoDetect
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerComponent } from './banner.component';

describe('BannerComponent (AutoChangeDetect)', () => {
  let comp:    BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let h1:      HTMLElement;

  beforeEach(() => {
    // #docregion auto-detect
    TestBed.configureTestingModule({
      declarations: [ BannerComponent ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
    // #enddocregion auto-detect
    fixture = TestBed.createComponent(BannerComponent);
    comp = fixture.componentInstance;
    h1 = fixture.nativeElement.querySelector('h1');
  });

  // #docregion auto-detect-tests
  it('should display original title', () => {
    // 만세! `fixture.detectChanges()`는 더이상 필요 없습니다.
    expect(h1.textContent).toContain(comp.title);
  });

  it('should still see original title after comp.title change', () => {
    const oldTitle = comp.title;
    comp.title = 'Test Title';
    // 화면에 표시되는 문자열은 갱신되지 않습니다. 이 경우에는 변화감지 로직이 실행되지 않았습니다 :(
    expect(h1.textContent).toContain(oldTitle);
  });

  it('should display updated title after detectChanges', () => {
    comp.title = 'Test Title';
    fixture.detectChanges(); // 명시적으로 변화감지 로직을 실행합니다.
    expect(h1.textContent).toContain(comp.title);
  });
  // #enddocregion auto-detect-tests
});
