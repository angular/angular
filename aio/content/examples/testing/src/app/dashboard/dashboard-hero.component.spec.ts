
// #docplaster
import { async, ComponentFixture, TestBed
} from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { addMatchers, click } from '../../testing';

import { Hero } from '../model/hero';
import { DashboardHeroComponent } from './dashboard-hero.component';

beforeEach( addMatchers );

describe('DashboardHeroComponent class only', () => {
  // #docregion class-only
  it('raises the selected event when clicked', () => {
    const comp = new DashboardHeroComponent();
    const hero: Hero = { id: 42, name: 'Test' };
    comp.hero = hero;

    comp.selected.subscribe((selectedHero: Hero) => expect(selectedHero).toBe(hero));
    comp.click();
  });
  // #enddocregion class-only
});

describe('DashboardHeroComponent when tested directly', () => {

  let comp: DashboardHeroComponent;
  let expectedHero: Hero;
  let fixture: ComponentFixture<DashboardHeroComponent>;
  let heroDe: DebugElement;
  let heroEl: HTMLElement;

  beforeEach(async(() => {
    // #docregion setup, config-testbed
    TestBed.configureTestingModule({
      declarations: [ DashboardHeroComponent ]
    })
    // #enddocregion setup, config-testbed
    .compileComponents();
  }));

  beforeEach(() => {
    // #docregion setup
    fixture = TestBed.createComponent(DashboardHeroComponent);
    comp    = fixture.componentInstance;

    // 컴포넌트의 DebugElement와 HTMLElement를 참조합니다.
    heroDe  = fixture.debugElement.query(By.css('.hero'));
    heroEl = heroDe.nativeElement;

    // 컴포넌트에 사용할 히어로 정보를 선언합니다.
    expectedHero = { id: 42, name: 'Test Name' };

    // 부모 컴포넌트에서 입력 프로퍼티로 받는 과정을 처리합니다.
    comp.hero = expectedHero;

    // 초기 데이터 바인딩을 실행합니다.
    fixture.detectChanges();
    // #enddocregion setup
  });

  // #docregion name-test
  it('should display hero name in uppercase', () => {
    const expectedPipedName = expectedHero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });
  // #enddocregion name-test

  // #docregion click-test
  it('should raise selected event when clicked (triggerEventHandler)', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

  // #docregion trigger-event-handler
    heroDe.triggerEventHandler('click', null);
  // #enddocregion trigger-event-handler
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test

    // #docregion click-test-2
    it('should raise selected event when clicked (element.click)', () => {
      let selectedHero: Hero;
      comp.selected.subscribe((hero: Hero) => selectedHero = hero);

      heroEl.click();
      expect(selectedHero).toBe(expectedHero);
    });
    // #enddocregion click-test-2

  // #docregion click-test-3
  it('should raise selected event when clicked (click helper)', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

    click(heroDe); // DebugElement로 클릭 헬퍼를 실행합니다.
    click(heroEl); // 네이티브 엘리먼트로 클릭 헬퍼를 실행합니다.

    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-3
});

//////////////////

describe('DashboardHeroComponent when inside a test host', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let heroEl: HTMLElement;

  beforeEach(async(() => {
    // #docregion test-host-setup
    TestBed.configureTestingModule({
      declarations: [ DashboardHeroComponent, TestHostComponent ]
    })
    // #enddocregion test-host-setup
    .compileComponents();
  }));

  beforeEach(() => {
    // #docregion test-host-setup
    // DashboardHeroComponent 대신 TestHostComponent를 생성합니다.
    fixture  = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    heroEl   = fixture.nativeElement.querySelector('.hero');
    fixture.detectChanges(); // 초기 데이터 바인딩을 실행합니다.
    // #enddocregion test-host-setup
  });

  // #docregion test-host-tests
  it('should display hero name', () => {
    const expectedPipedName = testHost.hero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });

  it('should raise selected event when clicked', () => {
    click(heroEl);
    // 선택된 히어로는 데이터 바인딩한 히어로와 같아야 합니다.
    expect(testHost.selectedHero).toBe(testHost.hero);
  });
  // #enddocregion test-host-tests
});

////// Test Host Component //////
import { Component } from '@angular/core';

// #docregion test-host
@Component({
  template: `
    <dashboard-hero
      [hero]="hero" (selected)="onSelected($event)">
    </dashboard-hero>`
})
class TestHostComponent {
  hero: Hero = {id: 42, name: 'Test Name' };
  selectedHero: Hero;
  onSelected(hero: Hero) { this.selectedHero = hero; }
}
// #enddocregion test-host
