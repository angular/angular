import {browser, element, by, ElementFinder} from 'protractor';

describe('Dependency Injection Tests', () => {
  let expectedMsg: string;
  let expectedMsgRx: RegExp;

  beforeAll(() => browser.get(''));

  describe('Cars:', () => {
    it('DI car displays as expected', async () => {
      expectedMsg = 'DI car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#di')).getText()).toEqual(expectedMsg);
    });

    it('No DI car displays as expected', async () => {
      expectedMsg = 'No DI car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#nodi')).getText()).toEqual(expectedMsg);
    });

    it('Injector car displays as expected', async () => {
      expectedMsg = 'Injector car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#injector')).getText()).toEqual(expectedMsg);
    });

    it('Factory car displays as expected', async () => {
      expectedMsg = 'Factory car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#factory')).getText()).toEqual(expectedMsg);
    });

    it('Simple car displays as expected', async () => {
      expectedMsg = 'Simple car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#simple')).getText()).toEqual(expectedMsg);
    });

    it('Super car displays as expected', async () => {
      expectedMsg = 'Super car with 12 cylinders and Flintstone tires.';
      expect(await element(by.css('#super')).getText()).toEqual(expectedMsg);
    });

    it('Test car displays as expected', async () => {
      expectedMsg = 'Test car with 8 cylinders and YokoGoodStone tires.';
      expect(await element(by.css('#test')).getText()).toEqual(expectedMsg);
    });
  });

  describe('Other Injections:', () => {
    it('DI car displays as expected', async () => {
      expectedMsg = 'DI car with 4 cylinders and Flintstone tires.';
      expect(await element(by.css('#car')).getText()).toEqual(expectedMsg);
    });

    it('Hero displays as expected', async () => {
      expectedMsg = 'Dr. Nice';
      expect(await element(by.css('#hero')).getText()).toEqual(expectedMsg);
    });

    it('Optional injection displays as expected', async () => {
      expectedMsg = "R.O.U.S.'s? I don't think they exist!";
      expect(await element(by.css('#rodent')).getText()).toEqual(expectedMsg);
    });
  });

  describe('Tests:', () => {
    it('Tests display as expected', async () => {
      expectedMsgRx = /Tests passed/;
      expect(await element(by.css('#tests')).getText()).toMatch(expectedMsgRx);
    });
  });

  describe('Provider variations:', () => {
    it('P1 (class) displays as expected', async () => {
      expectedMsg = 'Hello from logger provided with Logger class';
      expect(await element(by.css('#p1')).getText()).toEqual(expectedMsg);
    });

    it('P3 (provide) displays as expected', async () => {
      expectedMsg = 'Hello from logger provided with useClass:Logger';
      expect(await element(by.css('#p3')).getText()).toEqual(expectedMsg);
    });

    it('P4 (useClass:BetterLogger) displays as expected', async () => {
      expectedMsg = 'Hello from logger provided with useClass:BetterLogger';
      expect(await element(by.css('#p4')).getText()).toEqual(expectedMsg);
    });

    it('P5 (useClass:EvenBetterLogger - dependency)  displays as expected', async () => {
      expectedMsg = 'Message to Bob: Hello from EvenBetterlogger';
      expect(await element(by.css('#p5')).getText()).toEqual(expectedMsg);
    });

    it('P6a (no alias) displays as expected', async () => {
      expectedMsg = 'Hello OldLogger (but we want NewLogger)';
      expect(await element(by.css('#p6a')).getText()).toEqual(expectedMsg);
    });

    it('P6b (alias) displays as expected', async () => {
      expectedMsg = 'Hello from NewLogger (via aliased OldLogger)';
      expect(await element(by.css('#p6b')).getText()).toEqual(expectedMsg);
    });

    it('P7 (useValue) displays as expected', async () => {
      expectedMsg = 'Silent logger says "Shhhhh!". Provided via "useValue"';
      expect(await element(by.css('#p7')).getText()).toEqual(expectedMsg);
    });

    it('P8 (useFactory) displays as expected', async () => {
      expectedMsg = 'Hero service injected successfully via heroServiceProvider';
      expect(await element(by.css('#p8')).getText()).toEqual(expectedMsg);
    });

    it('P9 (InjectionToken) displays as expected', async () => {
      expectedMsg = 'APP_CONFIG Application title is Dependency Injection';
      expect(await element(by.css('#p9')).getText()).toEqual(expectedMsg);
    });

    it('P10 (optional dependency) displays as expected', async () => {
      expectedMsg = 'Optional logger was not available';
      expect(await element(by.css('#p10')).getText()).toEqual(expectedMsg);
    });
  });

  describe('User/Heroes:', () => {
    it('User is Bob - unauthorized', async () => {
      expectedMsgRx = /Bob, is not authorized/;
      expect(await element(by.css('#user')).getText()).toMatch(expectedMsgRx);
    });

    it('should have button', async () => {
      expect(
        await element.all(by.cssContainingText('button', 'Next User')).get(0).isDisplayed(),
      ).toBe(true, "'Next User' button should be displayed");
    });

    it('unauthorized user should have multiple unauthorized heroes', async () => {
      const heroes = element.all(by.css('#unauthorized app-hero-list div'));
      expect(await heroes.count()).toBeGreaterThan(0);
    });

    it('unauthorized user should have no secret heroes', async () => {
      const heroes = element.all(by.css('#unauthorized app-hero-list div'));
      expect(await heroes.count()).toBeGreaterThan(0);

      const filteredHeroes = heroes.filter(async (elem) => /secret/.test(await elem.getText()));
      expect(await filteredHeroes.count()).toEqual(0);
    });

    it('unauthorized user should have no authorized heroes listed', async () => {
      expect(await element.all(by.css('#authorized app-hero-list div')).count()).toEqual(0);
    });

    describe('after button click', () => {
      beforeAll(async () => {
        const buttonEle = element.all(by.cssContainingText('button', 'Next User')).get(0);
        await buttonEle.click();
      });

      it('User is Alice  - authorized', async () => {
        expectedMsgRx = /Alice, is authorized/;
        expect(await element(by.css('#user')).getText()).toMatch(expectedMsgRx);
      });

      it('authorized user should have multiple authorized heroes ', async () => {
        const heroes = element.all(by.css('#authorized app-hero-list div'));
        expect(await heroes.count()).toBeGreaterThan(0);
      });

      it('authorized user should have multiple authorized heroes with tree-shakeable HeroesService', async () => {
        const heroes = element.all(by.css('#tspAuthorized app-hero-list div'));
        expect(await heroes.count()).toBeGreaterThan(0);
      });

      it('authorized user should have secret heroes', async () => {
        const heroes = element.all(by.css('#authorized app-hero-list div'));
        expect(await heroes.count()).toBeGreaterThan(0);

        const filteredHeroes = heroes.filter(async (elem) => /secret/.test(await elem.getText()));
        expect(await filteredHeroes.count()).toBeGreaterThan(0);
      });

      it('authorized user should have no unauthorized heroes listed', async () => {
        expect(await element.all(by.css('#unauthorized app-hero-list div')).count()).toEqual(0);
      });
    });
  });
});
