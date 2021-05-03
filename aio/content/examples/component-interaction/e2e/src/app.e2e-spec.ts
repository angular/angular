import { browser, by, element } from 'protractor';

describe('Component Communication Cookbook Tests', () => {

  beforeEach(() => browser.get(browser.baseUrl));

  describe('Parent-to-child communication', () => {
    // #docregion parent-to-child
    // ...
    const heroNames = ['Dr IQ', 'Magneta', 'Bombasto'];
    const masterName = 'Master';

    it('should pass properties to children properly', async () => {
      const parent = element(by.tagName('app-hero-parent'));
      const heroes = parent.all(by.tagName('app-hero-child'));

      for (let i = 0; i < heroNames.length; i++) {
        const childTitle = await heroes.get(i).element(by.tagName('h3')).getText();
        const childDetail = await heroes.get(i).element(by.tagName('p')).getText();
        expect(childTitle).toEqual(heroNames[i] + ' says:');
        expect(childDetail).toContain(masterName);
      }
    });
    // ...
    // #enddocregion parent-to-child
  });

  describe('Parent-to-child communication with setter', () => {
    // #docregion parent-to-child-setter
    // ...
    it('should display trimmed, non-empty names', async () => {
      const nonEmptyNameIndex = 0;
      const nonEmptyName = '"Dr IQ"';
      const parent = element(by.tagName('app-name-parent'));
      const hero = parent.all(by.tagName('app-name-child')).get(nonEmptyNameIndex);

      const displayName = await hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(nonEmptyName);
    });

    it('should replace empty name with default name', async () => {
      const emptyNameIndex = 1;
      const defaultName = '"<no name set>"';
      const parent = element(by.tagName('app-name-parent'));
      const hero = parent.all(by.tagName('app-name-child')).get(emptyNameIndex);

      const displayName = await hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(defaultName);
    });
    // ...
    // #enddocregion parent-to-child-setter
  });

  describe('Parent-to-child communication with ngOnChanges', () => {
    // #docregion parent-to-child-onchanges
    // ...
    // Test must all execute in this exact order
    it('should set expected initial values', async () => {
      const actual = await getActual();

      const initialLabel = 'Version 1.23';
      const initialLog = 'Initial value of major set to 1, Initial value of minor set to 23';

      expect(actual.label).toBe(initialLabel);
      expect(actual.count).toBe(1);
      expect(await actual.logs.get(0).getText()).toBe(initialLog);
    });

    it('should set expected values after clicking \'Minor\' twice', async () => {
      const repoTag = element(by.tagName('app-version-parent'));
      const newMinorButton = repoTag.all(by.tagName('button')).get(0);

      await newMinorButton.click();
      await newMinorButton.click();

      const actual = await getActual();

      const labelAfter2Minor = 'Version 1.25';
      const logAfter2Minor = 'minor changed from 24 to 25';

      expect(actual.label).toBe(labelAfter2Minor);
      expect(actual.count).toBe(3);
      expect(await actual.logs.get(2).getText()).toBe(logAfter2Minor);
    });

    it('should set expected values after clicking \'Major\' once', async () => {
      const repoTag = element(by.tagName('app-version-parent'));
      const newMajorButton = repoTag.all(by.tagName('button')).get(1);

      await newMajorButton.click();
      const actual = await getActual();

      const labelAfterMajor = 'Version 2.0';
      const logAfterMajor = 'major changed from 1 to 2, minor changed from 23 to 0';

      expect(actual.label).toBe(labelAfterMajor);
      expect(actual.count).toBe(2);
      expect(await actual.logs.get(1).getText()).toBe(logAfterMajor);
    });

    async function getActual() {
      const versionTag = element(by.tagName('app-version-child'));
      const label = await versionTag.element(by.tagName('h3')).getText();
      const ul = versionTag.element((by.tagName('ul')));
      const logs = ul.all(by.tagName('li'));

      return {
        label,
        logs,
        count: await logs.count(),
      };
    }
    // ...
    // #enddocregion parent-to-child-onchanges
  });

  describe('Child-to-parent communication', () => {
    // #docregion child-to-parent
    // ...
    it('should not emit the event initially', async () => {
      const voteLabel = element(by.tagName('app-vote-taker')).element(by.tagName('h3'));
      expect(await voteLabel.getText()).toBe('Agree: 0, Disagree: 0');
    });

    it('should process Agree vote', async () => {
      const voteLabel = element(by.tagName('app-vote-taker')).element(by.tagName('h3'));
      const agreeButton1 = element.all(by.tagName('app-voter')).get(0)
        .all(by.tagName('button')).get(0);

      await agreeButton1.click();

      expect(await voteLabel.getText()).toBe('Agree: 1, Disagree: 0');
    });

    it('should process Disagree vote', async () => {
      const voteLabel = element(by.tagName('app-vote-taker')).element(by.tagName('h3'));
      const agreeButton1 = element.all(by.tagName('app-voter')).get(1)
        .all(by.tagName('button')).get(1);

      await agreeButton1.click();

      expect(await voteLabel.getText()).toBe('Agree: 0, Disagree: 1');
    });
    // ...
    // #enddocregion child-to-parent
  });

  describe('Parent calls child via local var', () => {
    countDownTimerTests('app-countdown-parent-lv');
  });

  describe('Parent calls ViewChild', () => {
    countDownTimerTests('app-countdown-parent-vc');
  });

  function countDownTimerTests(parentTag: string) {
    // #docregion countdown-timer-tests
    // ...
    // The tests trigger periodic asynchronous operations (via `setInterval()`), which will prevent
    // the app from stabilizing. See https://angular.io/api/core/ApplicationRef#is-stable-examples
    // for more details.
    // To allow the tests to complete, we will disable automatically waiting for the Angular app to
    // stabilize.
    beforeEach(() => browser.waitForAngularEnabled(false));
    afterEach(() => browser.waitForAngularEnabled(true));

    it('timer and parent seconds should match', async () => {
      const parent = element(by.tagName(parentTag));
      const startButton = parent.element(by.buttonText('Start'));
      const seconds = parent.element(by.className('seconds'));
      const timer = parent.element(by.tagName('app-countdown-timer'));

      await startButton.click();

      // Wait for `<app-countdown-timer>` to be populated with any text.
      await browser.wait(() => timer.getText(), 2000);

      expect(await timer.getText()).toContain(await seconds.getText());
    });

    it('should stop the countdown', async () => {
      const parent = element(by.tagName(parentTag));
      const startButton = parent.element(by.buttonText('Start'));
      const stopButton = parent.element(by.buttonText('Stop'));
      const timer = parent.element(by.tagName('app-countdown-timer'));

      await startButton.click();
      expect(await timer.getText()).not.toContain('Holding');

      await stopButton.click();
      expect(await timer.getText()).toContain('Holding');
    });
    // ...
    // #enddocregion countdown-timer-tests
  }

  describe('Parent and children communicate via a service', () => {
    // #docregion bidirectional-service
    // ...
    it('should announce a mission', async () => {
      const missionControl = element(by.tagName('app-mission-control'));
      const announceButton = missionControl.all(by.tagName('button')).get(0);
      const history = missionControl.all(by.tagName('li'));

      await announceButton.click();

      expect(await history.count()).toBe(1);
      expect(await history.get(0).getText()).toMatch(/Mission.* announced/);
    });

    it('should confirm the mission by Lovell', async () => {
      await testConfirmMission(1, 'Lovell');
    });

    it('should confirm the mission by Haise', async () => {
      await testConfirmMission(3, 'Haise');
    });

    it('should confirm the mission by Swigert', async () => {
      await testConfirmMission(2, 'Swigert');
    });

    async function testConfirmMission(buttonIndex: number, astronaut: string) {
      const missionControl = element(by.tagName('app-mission-control'));
      const announceButton = missionControl.all(by.tagName('button')).get(0);
      const confirmButton = missionControl.all(by.tagName('button')).get(buttonIndex);
      const history = missionControl.all(by.tagName('li'));

      await announceButton.click();
      await confirmButton.click();

      expect(await history.count()).toBe(2);
      expect(await history.get(1).getText()).toBe(`${astronaut} confirmed the mission`);
    }
    // ...
    // #enddocregion bidirectional-service
  });

});
