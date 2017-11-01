// #docregion
// #docplaster
// #docregion testing-setup
import 'rxjs/add/observable/of';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HeroService } from './hero.service';
import { Hero } from './hero';

import { HeroDetailComponent } from './hero-detail.component';

export class MockActivatedRoute {
  params = new BehaviorSubject({});
}

export class MockHeroService {
  getHero() {}
}

describe('Hero Detail Component', () => {
  let component: HeroDetailComponent;
  let fixture: ComponentFixture<HeroDetailComponent>;
  let heroService: HeroService;
  let route: MockActivatedRoute;
  let hero: Hero = { id: 1, name: 'Test' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroDetailComponent ],
      providers: [
        { provide: HeroService, useClass: MockHeroService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute }
      ]
    });

    heroService = TestBed.get(HeroService);
    route = TestBed.get(ActivatedRoute);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroDetailComponent);
    component = fixture.componentInstance;
  });
// #enddocregion testing-setup
// #docregion testing-service-call
  it('should call the hero service with the provided id', () => {
    spyOn(heroService, 'getHero').and.returnValue(Observable.of(hero));

    route.params.next({ id: hero.id });
    fixture.detectChanges();

    expect(heroService.getHero).toHaveBeenCalledWith(hero.id);
  });
// #enddocregion testing-service-call

// #docregion testing-component-template
  it('should display the provided hero', () => {
    spyOn(heroService, 'getHero').and.returnValue(Observable.of(hero));

    route.params.next({ id: hero.id });
    fixture.detectChanges();

    const componentElement = fixture.debugElement.nativeElement;
    expect(componentElement.textContent).toContain(`ID: ${hero.id}`);
  });
// #enddocregion testing-component-template
// #docregion testing-setup
});
// #enddocregion testing-setup
