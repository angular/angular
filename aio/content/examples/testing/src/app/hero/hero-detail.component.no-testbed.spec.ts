import { asyncData, ActivatedRouteStub } from '../../testing';

import { HeroDetailComponent } from './hero-detail.component';
import { Hero } from '../model/hero';

//////////  Tests  ////////////////////

describe('HeroDetailComponent - no TestBed', () => {
  let comp: HeroDetailComponent;
  let expectedHero: Hero;
  let hds: any;
  let router: any;

  beforeEach((done: DoneFn) => {
    expectedHero = {id: 42, name: 'Bubba' };
    const activatedRoute = new ActivatedRouteStub({ id: expectedHero.id });
    router = jasmine.createSpyObj('router', ['navigate']);

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
    expect(router.navigate.calls.any()).toBe(true, 'router.navigate called');
  });

  it('should save when click save', () => {
    comp.save();
    expect(hds.saveHero.calls.any()).toBe(true, 'HeroDetailService.save called');
    expect(router.navigate.calls.any()).toBe(false, 'router.navigate not called yet');
  });

  it('should navigate when click save resolves', (done: DoneFn) => {
    comp.save();
    // waits for async save to complete before navigating
    hds.saveHero.calls.first().returnValue
    .subscribe(() => {
      expect(router.navigate.calls.any()).toBe(true, 'router.navigate called');
      done();
    });
  });

});
