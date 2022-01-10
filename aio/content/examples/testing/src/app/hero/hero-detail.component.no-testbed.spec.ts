import { Router } from '@angular/router';

import { asyncData, ActivatedRouteStub } from '../../testing';

import { HeroDetailComponent } from './hero-detail.component';
import { HeroDetailService } from './hero-detail.service';
import { Hero } from '../model/hero';

//////////  Tests  ////////////////////

describe('HeroDetailComponent - no TestBed', () => {
  let comp: HeroDetailComponent;
  let expectedHero: Hero;
  let hds: jasmine.SpyObj<HeroDetailService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach((done: DoneFn) => {
    expectedHero = {id: 42, name: 'Bubba' };
    const activatedRoute = new ActivatedRouteStub({ id: expectedHero.id });
    router = jasmine.createSpyObj('Router', ['navigate']);

    hds = jasmine.createSpyObj('HeroDetailService', ['getHero', 'saveHero']);
    hds.getHero.and.returnValue(asyncData(expectedHero));
    hds.saveHero.and.returnValue(asyncData(expectedHero));

    comp = new HeroDetailComponent(hds, activatedRoute as any, router);
    comp.ngOnInit();

    // OnInit calls HDS.getHero; wait for it to get the fake hero
    hds.getHero.calls.first().returnValue.subscribe(done);
  });

  it('should expose the hero retrieved from the service', () => {
    expect(comp.hero).toBe(expectedHero);
  });

  it('should navigate when click cancel', () => {
    comp.cancel();
    expect(router.navigate.calls.any())
      .withContext('router.navigate called')
      .toBe(true);
  });

  it('should save when click save', () => {
    comp.save();
    expect(hds.saveHero.calls.any())
      .withContext('HeroDetailService.save called')
      .toBe(true);
    expect(router.navigate.calls.any())
      .withContext('router.navigate not called yet')
      .toBe(false);
  });

  it('should navigate when click save resolves', (done: DoneFn) => {
    comp.save();
    // waits for async save to complete before navigating
    hds.saveHero.calls.first().returnValue
    .subscribe(() => {
      expect(router.navigate.calls.any())
        .withContext('router.navigate called')
        .toBe(true);
      done();
    });
  });

});
