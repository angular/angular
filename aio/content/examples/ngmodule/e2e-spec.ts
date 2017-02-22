'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('NgModule', function () {

  // helpers
  const gold = 'rgba(255, 215, 0, 1)';
  const powderblue = 'rgba(176, 224, 230, 1)';
  const lightgray = 'rgba(211, 211, 211, 1)';
  const white = 'rgba(0, 0, 0, 0)';

  function getCommonsSectionStruct() {
    const buttons = element.all(by.css('nav a'));

    return {
      title: element.all(by.tagName('h1')).get(0),
      subtitle: element.all(by.css('app-title p i')).get(0),
      contactButton: buttons.get(0),
      crisisButton: buttons.get(1),
      heroesButton: buttons.get(2)
    };
  }

  function getContactSectionStruct() {
    const buttons = element.all(by.css('app-contact form button'));

    return {
      header: element.all(by.css('app-contact h2')).get(0),
      popupMessage: element.all(by.css('app-contact div')).get(0),
      contactNameHeader: element.all(by.css('app-contact form h3')).get(0),
      input: element.all(by.css('app-contact form input')).get(0),
      validationError: element.all(by.css('app-contact form .alert')).get(0),
      saveButton: buttons.get(0), // can't be tested
      nextContactButton: buttons.get(1),
      newContactButton: buttons.get(2)
    };
  }

  function getCrisisSectionStruct() {
    return {
      title: element.all(by.css('ng-component h3')).get(0),
      items: element.all(by.css('ng-component a')),
      itemId: element.all(by.css('ng-component div')).get(0),
      listLink: element.all(by.css('ng-component a')).get(0),
    };
  }

  function getHeroesSectionStruct() {
    return {
      header: element.all(by.css('ng-component h2')).get(0),
      title: element.all(by.css('ng-component h3')).get(0),
      items: element.all(by.css('ng-component a')),
      itemId: element.all(by.css('ng-component ng-component div div')).get(0),
      itemInput: element.all(by.css('ng-component ng-component input')).get(0),
      listLink: element.all(by.css('ng-component ng-component a')).get(0),
    };
  }

  // tests
  function appTitleTests(color: string, name?: string) {
    return function() {
      it('should have a gray header', function() {
        const commons = getCommonsSectionStruct();
        expect(commons.title.getCssValue('backgroundColor')).toBe(color);
      });

      it('should welcome us', function () {
        const commons = getCommonsSectionStruct();
        expect(commons.subtitle.getText()).toBe('Welcome, ' + (name ||  'Sherlock Holmes'));
      });
    };
  }

  function contactTests(color: string, name?: string) {
    return function() {
      it('shows the contact\'s owner', function() {
        const contacts = getContactSectionStruct();
        expect(contacts.header.getText()).toBe('Contact of ' + (name ||  'Sherlock Holmes'));
      });

      it('can cycle between contacts', function () {
        const contacts = getContactSectionStruct();
        const nextButton = contacts.nextContactButton;
        expect(contacts.contactNameHeader.getText()).toBe('Awesome Sam Spade');
        expect(contacts.contactNameHeader.getCssValue('backgroundColor')).toBe(color);
        nextButton.click().then(function () {
          expect(contacts.contactNameHeader.getText()).toBe('Awesome Nick Danger');
          return nextButton.click();
        }).then(function () {
          expect(contacts.contactNameHeader.getText()).toBe('Awesome Nancy Drew');
        });
      });

      it('can change an existing contact', function () {
        const contacts = getContactSectionStruct();
        contacts.input.sendKeys('a');
        expect(contacts.input.getCssValue('backgroundColor')).toBe(color);
        expect(contacts.contactNameHeader.getText()).toBe('Awesome Sam Spadea');
      });

      it('can create a new contact', function () {
        const contacts = getContactSectionStruct();
        const newContactButton = contacts.newContactButton;
        newContactButton.click().then(function () {
          expect(contacts.validationError.getText()).toBe('Name is required');
          contacts.input.sendKeys('John Doe');
          expect(contacts.contactNameHeader.getText()).toBe('Awesome John Doe');
          expect(contacts.validationError.getText()).toBe('');
        });
      });
    };
  }

  describe('index.html', function () {
    beforeEach(function () {
      browser.get('');
    });

    describe('app-title', appTitleTests(white, 'Miss Marple'));

    describe('contact', contactTests(lightgray, 'Miss Marple'));

    describe('crisis center', function () {
      beforeEach(function () {
        getCommonsSectionStruct().crisisButton.click();
      });

      it('shows a list of crisis', function () {
        const crisis = getCrisisSectionStruct();
        expect(crisis.title.getText()).toBe('Crisis List');
        expect(crisis.items.count()).toBe(4);
        expect(crisis.items.get(0).getText()).toBe('1 - Dragon Burning Cities');
      });

      it('can navigate to one crisis details', function () {
        const crisis = getCrisisSectionStruct();
        crisis.items.get(0).click().then(function() {
          expect(crisis.itemId.getText()).toBe('Crisis id: 1');
          return crisis.listLink.click();
        }).then(function () {
          // We are back to the list
          expect(crisis.items.count()).toBe(4);
        });
      });
    });

    describe('heroes', function () {
      beforeEach(function () {
        getCommonsSectionStruct().heroesButton.click();
      });

      it('shows a list of heroes', function() {
        const heroes = getHeroesSectionStruct();
        expect(heroes.header.getText()).toBe('Heroes of Miss Marple');
        expect(heroes.title.getText()).toBe('Hero List');
        expect(heroes.items.count()).toBe(6);
        expect(heroes.items.get(0).getText()).toBe('11 - Mr. Nice');
      });

      it('can navigate and edit one hero details', function () {
        const heroes = getHeroesSectionStruct();
        heroes.items.get(0).click().then(function () {
          expect(heroes.itemId.getText()).toBe('Id: 11');
          heroes.itemInput.sendKeys(' try');
          return heroes.listLink.click();
        }).then(function () {
          // We are back to the list
          expect(heroes.items.count()).toBe(6);
          expect(heroes.items.get(0).getText()).toBe('11 - Mr. Nice try');
        });
      });
    });
  });

  describe('index.0.html', function() {
    beforeEach(function () {
      browser.get('index.0.html');
    });

    it('has a title', function () {
      const title = element.all(by.tagName('h1')).get(0);
      expect(title.getText()).toBe('Minimal NgModule');
    });
  });

  describe('index.1.html', function () {
    beforeEach(function () {
      browser.get('index.1.html');
    });

    describe('app-title', appTitleTests(powderblue));
  });

  describe('index.1b.html', function () {
    beforeEach(function () {
      browser.get('index.1b.html');
    });

    describe('app-title', appTitleTests(powderblue));

    describe('contact', contactTests(powderblue));
  });

  describe('index.2.html', function () {
    beforeEach(function () {
      browser.get('index.2.html');
    });

    describe('app-title', appTitleTests(gold));

    describe('contact', contactTests(powderblue));
  });

  describe('index.3.html', function () {
    beforeEach(function () {
      browser.get('index.3.html');
    });

    describe('app-title', appTitleTests(gold));
  });

});
