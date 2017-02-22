'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

describe('Component Communication Cookbook Tests', function () {

  // Note: '?e2e' which app can read to know it is running in protractor
  // e.g. `if (!/e2e/.test(location.search)) { ...`
  beforeAll(function () {
    browser.get('?e2e');
  });

  describe('Parent-to-child communication', function() {
    // #docregion parent-to-child
    // ...
    let _heroNames = ['Mr. IQ', 'Magneta', 'Bombasto'];
    let _masterName = 'Master';

    it('should pass properties to children properly', function () {
      let parent = element.all(by.tagName('hero-parent')).get(0);
      let heroes = parent.all(by.tagName('hero-child'));

      for (let i = 0; i < _heroNames.length; i++) {
        let childTitle = heroes.get(i).element(by.tagName('h3')).getText();
        let childDetail = heroes.get(i).element(by.tagName('p')).getText();
        expect(childTitle).toEqual(_heroNames[i] + ' says:');
        expect(childDetail).toContain(_masterName);
      }
    });
    // ...
    // #enddocregion parent-to-child
  });

  describe('Parent-to-child communication with setter', function() {
    // #docregion parent-to-child-setter
    // ...
    it('should display trimmed, non-empty names', function () {
      let _nonEmptyNameIndex = 0;
      let _nonEmptyName = '"Mr. IQ"';
      let parent = element.all(by.tagName('name-parent')).get(0);
      let hero = parent.all(by.tagName('name-child')).get(_nonEmptyNameIndex);

      let displayName = hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(_nonEmptyName);
    });

    it('should replace empty name with default name', function () {
      let _emptyNameIndex = 1;
      let _defaultName = '"<no name set>"';
      let parent = element.all(by.tagName('name-parent')).get(0);
      let hero = parent.all(by.tagName('name-child')).get(_emptyNameIndex);

      let displayName = hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(_defaultName);
    });
    // ...
    // #enddocregion parent-to-child-setter
  });

  describe('Parent-to-child communication with ngOnChanges', function() {
    // #docregion parent-to-child-onchanges
    // ...
    // Test must all execute in this exact order
    it('should set expected initial values', function () {
      let actual = getActual();

      let initialLabel = 'Version 1.23';
      let initialLog = 'Initial value of major set to 1, Initial value of minor set to 23';

      expect(actual.label).toBe(initialLabel);
      expect(actual.count).toBe(1);
      expect(actual.logs.get(0).getText()).toBe(initialLog);
    });

    it('should set expected values after clicking \'Minor\' twice', function () {
      let repoTag = element(by.tagName('version-parent'));
      let newMinorButton = repoTag.all(by.tagName('button')).get(0);

      newMinorButton.click().then(function() {
        newMinorButton.click().then(function() {
          let actual = getActual();

          let labelAfter2Minor = 'Version 1.25';
          let logAfter2Minor = 'minor changed from 24 to 25';

          expect(actual.label).toBe(labelAfter2Minor);
          expect(actual.count).toBe(3);
          expect(actual.logs.get(2).getText()).toBe(logAfter2Minor);
        });
      });
    });

    it('should set expected values after clicking \'Major\' once', function () {
      let repoTag = element(by.tagName('version-parent'));
      let newMajorButton = repoTag.all(by.tagName('button')).get(1);

      newMajorButton.click().then(function() {
        let actual = getActual();

        let labelAfterMajor = 'Version 2.0';
        let logAfterMajor = 'major changed from 1 to 2, minor changed from 25 to 0';

        expect(actual.label).toBe(labelAfterMajor);
        expect(actual.count).toBe(4);
        expect(actual.logs.get(3).getText()).toBe(logAfterMajor);
      });
    });

    function getActual() {
      let versionTag = element(by.tagName('version-child'));
      let label = versionTag.element(by.tagName('h3')).getText();
      let ul = versionTag.element((by.tagName('ul')));
      let logs = ul.all(by.tagName('li'));

      return {
        label: label,
        logs: logs,
        count: logs.count()
      };
    }
    // ...
    // #enddocregion parent-to-child-onchanges

  });

  describe('Child-to-parent communication', function() {
    // #docregion child-to-parent
    // ...
    it('should not emit the event initially', function () {
      let voteLabel = element(by.tagName('vote-taker'))
        .element(by.tagName('h3')).getText();
      expect(voteLabel).toBe('Agree: 0, Disagree: 0');
    });

    it('should process Agree vote', function () {
      let agreeButton1 = element.all(by.tagName('my-voter')).get(0)
        .all(by.tagName('button')).get(0);
      agreeButton1.click().then(function() {
        let voteLabel = element(by.tagName('vote-taker'))
          .element(by.tagName('h3')).getText();
        expect(voteLabel).toBe('Agree: 1, Disagree: 0');
      });
    });

    it('should process Disagree vote', function () {
      let agreeButton1 = element.all(by.tagName('my-voter')).get(1)
        .all(by.tagName('button')).get(1);
      agreeButton1.click().then(function() {
        let voteLabel = element(by.tagName('vote-taker'))
          .element(by.tagName('h3')).getText();
        expect(voteLabel).toBe('Agree: 1, Disagree: 1');
      });
    });
    // ...
    // #enddocregion child-to-parent
  });

  // Can't run timer tests in protractor because
  // interaction w/ zones causes all tests to freeze & timeout.
  xdescribe('Parent calls child via local var', function() {
    countDownTimerTests('countdown-parent-lv');
  });

  xdescribe('Parent calls ViewChild', function() {
    countDownTimerTests('countdown-parent-vc');
  });

  function countDownTimerTests(parentTag: string) {
    // #docregion countdown-timer-tests
    // ...
    it('timer and parent seconds should match', function () {
      let parent = element(by.tagName(parentTag));
      let message = parent.element(by.tagName('countdown-timer')).getText();
      browser.sleep(10); // give `seconds` a chance to catchup with `message`
      let seconds = parent.element(by.className('seconds')).getText();
      expect(message).toContain(seconds);
    });

    it('should stop the countdown', function () {
      let parent = element(by.tagName(parentTag));
      let stopButton = parent.all(by.tagName('button')).get(1);

      stopButton.click().then(function() {
        let message = parent.element(by.tagName('countdown-timer')).getText();
        expect(message).toContain('Holding');
      });
    });
    // ...
    // #enddocregion countdown-timer-tests
  }


  describe('Parent and children communicate via a service', function() {
    // #docregion bidirectional-service
    // ...
    it('should announce a mission', function () {
      let missionControl = element(by.tagName('mission-control'));
      let announceButton = missionControl.all(by.tagName('button')).get(0);
      announceButton.click().then(function () {
        let history = missionControl.all(by.tagName('li'));
        expect(history.count()).toBe(1);
        expect(history.get(0).getText()).toMatch(/Mission.* announced/);
      });
    });

    it('should confirm the mission by Lovell', function () {
      testConfirmMission(1, 2, 'Lovell');
    });

    it('should confirm the mission by Haise', function () {
      testConfirmMission(3, 3, 'Haise');
    });

    it('should confirm the mission by Swigert', function () {
      testConfirmMission(2, 4, 'Swigert');
    });

    function testConfirmMission(buttonIndex: number, expectedLogCount: number, astronaut: string) {
      let _confirmedLog = ' confirmed the mission';
      let missionControl = element(by.tagName('mission-control'));
      let confirmButton = missionControl.all(by.tagName('button')).get(buttonIndex);
      confirmButton.click().then(function () {
        let history = missionControl.all(by.tagName('li'));
        expect(history.count()).toBe(expectedLogCount);
        expect(history.get(expectedLogCount - 1).getText()).toBe(astronaut + _confirmedLog);
      });
    }
    // ...
    // #enddocregion bidirectional-service
  });

});
