import { HeroListComponent } from './hero-list.component';

describe('HeroListComponent', () => {
  let component;

  let router;
  let heroService;

  // definition of dependencies as DI to re-store them in each test
  beforeEach(() => {
    router = {};
    heroService = { getHeroes: jasmine.createSpy('getHeroes') };
  });

  // initialisation of tested object
  beforeEach(() => {
    component = new HeroListComponent(router, heroService);
  });

  // # - define the scope of tested method with it's name
  describe('#ngOnInit', () => {
    // define static values for tested  method
    const heroes = 'heroes';

    // define dependency's behavior
    beforeEach(() => {
      // use primitives to simplify comparison with expected results
      heroService.getHeroes.and.returnValue(heroes);
    });

    it('should set list of heroes from #getHeroes', () => {
      expect(component.heroes).toBeUndefined();

      component.ngOnInit();

      // validation of used external method
      expect(heroService.getHeroes).toHaveBeenCalled();

      /**
       * based on valid naming it does not matter the compared type. In the test better to relay to its valid naming
       * sample: expect(component.heroes).toBe(villains); - looks like an issue
       */
      expect(component.heroes).toBe(heroes);
    });
  });

  describe('#onSelect', () => {
    // definition dynamic fields used only for tested method
    let hero;
    let navigate;

    //  // define static values for tested  method
    const selectedHeroId = 'selectedHeroId';
    const baseRoutePath = '../heroes';

    // define mock data for tested method
    beforeEach(() => {
      hero = {
        id: selectedHeroId,
      };
    });

    // define spies an their behavior/expected results
    beforeEach(() => {
      navigate = jasmine.createSpy('navigate');
      router.navigate = navigate;
    });

    // each simple block of tested method could be tested separately
    it('should set passed hero as selected', () => {
      expect(component.selectedHero).toBeUndefined();

      component.onSelect(hero);

      expect(component.selectedHero).toBe(hero);
    });

    it('should change application router to selected hero page based on passed hero id', () => {
      component.onSelect(hero);
      expect(navigate).toHaveBeenCalledWith([baseRoutePath, selectedHeroId]);
    });
  });
});
