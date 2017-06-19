import { HeroDetailComponent } from './hero-detail.component';
import { Hero }                from '../model';

import { ActivatedRouteStub }  from '../../testing';

//////////  Tests  ////////////////////

describe('HeroDetailComponent - no TestBed', () => {
  let activatedRoute: ActivatedRouteStub;
  let comp: HeroDetailComponent;
  let expectedHero: Hero;
  let hds: any;
  let router: any;

  beforeEach((done: any) => {
    expectedHero = new Hero(42, 'Bubba');
    activatedRoute = new ActivatedRouteStub();
    activatedRoute.testParamMap = { id: expectedHero.id };

    router = jasmine.createSpyObj('router', ['navigate']);

    hds = jasmine.createSpyObj('HeroDetailService', ['getHero', 'saveHero']);
    hds.getHero.and.returnValue(Promise.resolve(expectedHero));
    hds.saveHero.and.returnValue(Promise.resolve(expectedHero));

    comp = new HeroDetailComponent(hds, <any> activatedRoute, router);
    comp.ngOnInit();

    // OnInit calls HDS.getHero; wait for it to get the fake hero
    hds.getHero.calls.first().returnValue.then(done);
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

  it('should navigate when click save resolves', (done: any) => {
    comp.save();
    // waits for async save to complete before navigating
    hds.saveHero.calls.first().returnValue
    .then(() => {
      expect(router.navigate.calls.any()).toBe(true, 'router.navigate called');
      done();
    });
  });

});
