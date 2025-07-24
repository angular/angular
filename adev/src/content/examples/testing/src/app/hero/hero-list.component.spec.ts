import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';

import {Router} from '@angular/router';

import {addMatchers} from '../../testing';
import {HeroService} from '../model/hero.service';
import {getTestHeroes, TestHeroService} from '../model/testing/test-hero.service';

import {HeroListComponent} from './hero-list.component';
import {HighlightDirective} from '../shared/highlight.directive';
import {appConfig} from '../app.config';

const HEROES = getTestHeroes();

let comp: HeroListComponent;
let fixture: ComponentFixture<HeroListComponent>;
let page: Page;

/////// Tests //////

describe('HeroListComponent', () => {
  beforeEach(waitForAsync(() => {
    addMatchers();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        providers: [
          {provide: HeroService, useClass: TestHeroService},
          {provide: Router, useValue: routerSpy},
        ],
      }),
    )

      .then(createComponent);
  }));

  it('should display heroes', () => {
    expect(page.heroRows.length).toBeGreaterThan(0);
  });

  it('1st hero should match 1st test hero', () => {
    const expectedHero = HEROES[0];
    const actualHero = page.heroRows[0].textContent;
    expect(actualHero).withContext('hero.id').toContain(expectedHero.id.toString());
    expect(actualHero).withContext('hero.name').toContain(expectedHero.name);
  });

  it('should select hero on click', fakeAsync(() => {
    const expectedHero = HEROES[1];
    const btn = page.heroRows[1].querySelector('button');

    btn!.dispatchEvent(new Event('click'));
    tick();
    // `.toEqual` because selectedHero is clone of expectedHero; see FakeHeroService
    expect(comp.selectedHero).toEqual(expectedHero);
  }));

  it('should navigate to selected hero detail on click', fakeAsync(() => {
    const expectedHero = HEROES[1];
    const btn = page.heroRows[1].querySelector('button');

    btn!.dispatchEvent(new Event('click'));
    tick();

    // should have navigated
    expect(page.navSpy.calls.any()).withContext('navigate called').toBe(true);

    // composed hero detail will be URL like 'heroes/42'
    // expect link array with the route path and hero id
    // first argument to router.navigate is link array
    const navArgs = page.navSpy.calls.first().args[0];
    expect(navArgs[0]).withContext('nav to heroes detail URL').toContain('heroes');
    expect(navArgs[1]).withContext('expected hero.id').toBe(expectedHero.id);
  }));

  it('should find `HighlightDirective` with `By.directive', () => {
    // #docregion by
    // Can find DebugElement either by css selector or by directive
    const h2 = fixture.debugElement.query(By.css('h2'));
    const directive = fixture.debugElement.query(By.directive(HighlightDirective));
    // #enddocregion by
    expect(h2).toBe(directive);
  });

  it('should color header with `HighlightDirective`', () => {
    const h2 = page.highlightDe.nativeElement as HTMLElement;
    const bgColor = h2.style.backgroundColor;

    // different browsers report color values differently
    const isExpectedColor = bgColor === 'gold' || bgColor === 'rgb(255, 215, 0)';
    expect(isExpectedColor).withContext('backgroundColor').toBe(true);
  });

  it("the `HighlightDirective` is among the element's providers", () => {
    expect(page.highlightDe.providerTokens)
      .withContext('HighlightDirective')
      .toContain(HighlightDirective);
  });
});

/////////// Helpers /////

/** Create the component and set the `page` test variables */
function createComponent() {
  fixture = TestBed.createComponent(HeroListComponent);
  comp = fixture.componentInstance;

  // change detection triggers ngOnInit which gets a hero
  fixture.detectChanges();

  return fixture.whenStable().then(() => {
    // got the heroes and updated component
    // change detection updates the view
    fixture.detectChanges();
    page = new Page();
  });
}

class Page {
  /** Hero line elements */
  heroRows: HTMLLIElement[];

  /** Highlighted DebugElement */
  highlightDe: DebugElement;

  /** Spy on router navigate method */
  navSpy: jasmine.Spy;

  constructor() {
    const heroRowNodes = fixture.nativeElement.querySelectorAll('li');
    this.heroRows = Array.from(heroRowNodes);

    // Find the first element with an attached HighlightDirective
    this.highlightDe = fixture.debugElement.query(By.directive(HighlightDirective));

    // Get the component's injected router navigation spy
    const routerSpy = fixture.debugElement.injector.get(Router);
    this.navSpy = routerSpy.navigate as jasmine.Spy;
  }
}
