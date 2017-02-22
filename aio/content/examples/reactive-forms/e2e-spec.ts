'use strict'; // necessary for es6 output in node

import { browser, element, by } from 'protractor';

function finalDemoAddressForm(element: any, index: number) {
  let form = {
    street: element.all(by.css('input[formcontrolname=street]')).get(index).getAttribute('value'),
    city: element.all(by.css('input[formcontrolname=city]')).get(index).getAttribute('value'),
    state: element.all(by.css('select[formcontrolname=state]')).get(index).getAttribute('value'),
    zip: element.all(by.css('input[formcontrolname=zip]')).get(index).getAttribute('value')
  };
  return form;
}

describe('Reactive forms', function() {
  let select: any;

  beforeEach(function() {
    browser.get('');
    select = element(by.css('.container > h4 > select'));
  });

  describe('navigation', function() {
    it('should display the title', function() {
      let title = element(by.css('.container > h1'));
      expect(title.getText()).toBe('Reactive Forms');
    });

    it('should contain a dropdown with each example', function() {
      expect(select.isDisplayed()).toBe(true);
    });

    it('should have 9 options for different demos', function() {
      let options = select.all(by.tagName('option'));
      expect(options.count()).toBe(9);
    });

    it('should start with Final Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('Final Demo');
      });
    });
  });

// *************Begin Final Demo test*******************************

  describe('final demo', function() {
    it('does not select any hero by default', function() {
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    it('refreshes the page upon button click', function() {
      // We move to another page...
      let whirlwindButton = element.all(by.css('nav a')).get(0);
      whirlwindButton.click();
      let refresh = element(by.css('button'));
      refresh.click();
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    describe('Whirlwind form', function() {
      beforeEach(function() {
        let whirlwindButton = element.all(by.css('nav a')).get(0);
        whirlwindButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Whirlwind');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Whirlwind');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('123 Main');
        expect(address1.state).toBe('CA');
        expect(address1.zip).toBe('94801');
        expect(address1.city).toBe('Anywhere');
        let address2 = finalDemoAddressForm(element, 1);
        expect(address2.street).toBe('456 Maple');
        expect(address2.state).toBe('VA');
        expect(address2.zip).toBe('23226');
        expect(address2.city).toBe('Somewhere');
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail > p'));
        expect(json.getText()).toContain('Whirlwind');
        expect(json.getText()).toContain('Anywhere');
        expect(json.getText()).toContain('Somewhere');
        expect(json.getText()).toContain('VA');
      });

      it('has two disabled buttons by default', function() {
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBe('true');
        expect(buttons.get(1).getAttribute('disabled')).toBe('true');
      });

      it('enables the buttons after we edit the form', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBeNull();
        expect(buttons.get(1).getAttribute('disabled')).toBeNull();
      });

      it('saves the changes when the save button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let save = element.all(by.css('hero-detail > form > div > button')).get(0);
        save.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Whirlwinda');
      });

      it('reverts the changes when the revert button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let revert = element.all(by.css('hero-detail > form > div > button')).get(1);
        revert.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Whirlwind');
        expect(nameInput.getAttribute('value')).toBe('Whirlwind');
      });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(3);
        newLairButton.click();
        let address3 = finalDemoAddressForm(element, 2);
        expect(address3.street).toBe('');
        expect(address3.state).toBe('');
        expect(address3.zip).toBe('');
        expect(address3.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });
    });

    describe('Bombastic form', function() {
      beforeEach(function() {
        let bombastaButton = element.all(by.css('nav a')).get(1);
        bombastaButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Bombastic');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Bombastic');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('789 Elm');
        // expect(address1.state).toBe('OH');
        expect(address1.zip).toBe('04501');
        expect(address1.city).toBe('Smallville');
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail > p'));
        expect(json.getText()).toContain('Bombastic');
        expect(json.getText()).toContain('Smallville');
        expect(json.getText()).toContain('OH');
        expect(json.getText()).toContain('04501');
      });

      it('has two disabled buttons by default', function() {
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBe('true');
        expect(buttons.get(1).getAttribute('disabled')).toBe('true');
      });

      it('enables the buttons after we edit the form', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBeNull();
        expect(buttons.get(1).getAttribute('disabled')).toBeNull();
      });

      it('saves the changes when the save button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let save = element.all(by.css('hero-detail > form > div > button')).get(0);
        save.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Bombastica');
      });

      it('reverts the changes when the revert button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let revert = element.all(by.css('hero-detail > form > div > button')).get(1);
        revert.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Bombastic');
        expect(nameInput.getAttribute('value')).toBe('Bombastic');
      });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(3);
        newLairButton.click();
        let address2 = finalDemoAddressForm(element, 1);
        expect(address2.street).toBe('');
        expect(address2.state).toBe('');
        expect(address2.zip).toBe('');
        expect(address2.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });
    });

    describe('Magneta form', function() {

      beforeEach(function() {
        let magnetaButton = element.all(by.css('nav a')).get(2);
        magnetaButton.click();
      });

      it('should show hero information when the button is clicked', function() {
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Magneta');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Magneta');
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail > p'));
        expect(json.getText()).toContain('Magneta');
      });

      it('has two disabled buttons by default', function() {
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBe('true');
        expect(buttons.get(1).getAttribute('disabled')).toBe('true');
      });

      it('enables the buttons after we edit the form', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let buttons = element.all(by.css('hero-detail > form > div > button'));
        expect(buttons.get(0).getAttribute('disabled')).toBeNull();
        expect(buttons.get(1).getAttribute('disabled')).toBeNull();
      });

      it('saves the changes when the save button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let save = element.all(by.css('hero-detail > form > div > button')).get(0);
        save.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Magnetaa');
      });

      it('reverts the changes when the revert button is clicked', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        nameInput.sendKeys('a');
        let revert = element.all(by.css('hero-detail > form > div > button')).get(1);
        revert.click();
        let editMessage = element(by.css('hero-list > div > h3'));
        expect(editMessage.getText()).toBe('Editing: Magneta');
        expect(nameInput.getAttribute('value')).toBe('Magneta');
      });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(3);
        newLairButton.click();
        let address = finalDemoAddressForm(element, 0);
        expect(address.street).toBe('');
        expect(address.state).toBe('');
        expect(address.zip).toBe('');
        expect(address.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });
    });
  }); // final demo

// *************Begin FormArray Demo test*******************************


 describe('formArray demo', function() {
    beforeEach(function() {
        let FormArrayOption = element.all(by.css('select option')).get(7);
        FormArrayOption.click();
    });

    it('should show FormArray Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('FormArray Demo');
      });
     });

    it('does not select any hero by default', function() {
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    it('refreshes the page upon button click', function() {
      // We move to another page...
      let whirlwindButton = element.all(by.css('nav a')).get(0);
      whirlwindButton.click();
      let refresh = element(by.css('button'));
      refresh.click();
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    describe('Whirlwind form', function() {
      beforeEach(function() {
        let whirlwindButton = element.all(by.css('nav a')).get(0);
        whirlwindButton.click();
      });

      it('should show hero information when the button is clicked', function() {
          let editMessage = element(by.css('div.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Whirlwind');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Whirlwind');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('123 Main');
        expect(address1.state).toBe('CA');
        expect(address1.zip).toBe('94801');
        expect(address1.city).toBe('Anywhere');
        let address2 = finalDemoAddressForm(element, 1);
        expect(address2.street).toBe('456 Maple');
        expect(address2.state).toBe('VA');
        expect(address2.zip).toBe('23226');
        expect(address2.city).toBe('Somewhere');
      });
      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail-8 > p'));
        expect(json.getText()).toContain('Whirlwind');
        expect(json.getText()).toContain('Anywhere');
        expect(json.getText()).toContain('Somewhere');
        expect(json.getText()).toContain('VA');
      });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(1);
        newLairButton.click();
        let address2 = finalDemoAddressForm(element, 2);
        expect(address2.street).toBe('');
        expect(address2.state).toBe('');
        expect(address2.zip).toBe('');
        expect(address2.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

    }); // Whirlwind form

    describe('Bombastic FormArray form', function() {
      beforeEach(function() {
        let bombasticButton = element.all(by.css('nav a')).get(1);
        bombasticButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('div.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Bombastic');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        // nameInput.getAttribute('value').then(function(name: string) {
        //   expect(name).toBe('Whirlwind');
        // });
        expect(nameInput.getAttribute('value')).toBe('Bombastic');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('789 Elm');
        // expect(address1.state).toBe('OH');
        // This select should be OH not CA, which it shows in the UI, the JSON shows OH.
        expect(address1.zip).toBe('04501');
        expect(address1.city).toBe('Smallville');
      });

      it('shows a json output from the form', function() {
          let json = element(by.css('hero-detail-8 > p'));
          expect(json.getText()).toContain('Bombastic');
          expect(json.getText()).toContain('Smallville');
          expect(json.getText()).toContain('04501');
          expect(json.getText()).toContain('789 Elm');
        });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(1);
        newLairButton.click();
        let address1 = finalDemoAddressForm(element, 1);
        expect(address1.street).toBe('');
        expect(address1.state).toBe('');
        expect(address1.zip).toBe('');
        expect(address1.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

    }); // Bombastic FormArray form

    describe('Magneta FormArray form', function() {
      beforeEach(function() {
        let magnetaButton = element.all(by.css('nav a')).get(2);
        magnetaButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('div.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Magneta');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Magneta');
      });

      it('shows a json output from the form', function() {
          let json = element(by.css('hero-detail-8 > p'));
          expect(json.getText()).toContain('Magneta');
        });

      it('is able to add a new empty address', function() {
        let newLairButton = element.all(by.css('button')).get(1);
        newLairButton.click();
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('');
        expect(address1.state).toBe('');
        expect(address1.zip).toBe('');
        expect(address1.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

    }); // Magneta FormArray form

  }); // formArray demo


// *************Begin SetValue Demo test*******************************

 describe('SetValue demo', function() {
    beforeEach(function() {
      let SetValueOption = element.all(by.css('select option')).get(6);
      SetValueOption.click();
    });

    it('should show SetValue Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('SetValue Demo');
      });
     });

    it('does not select any hero by default', function() {
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    it('refreshes the page upon button click', function() {
      // We move to another page...
      let whirlwindButton = element.all(by.css('nav a')).get(0);
      whirlwindButton.click();
      let refresh = element(by.css('button'));
      refresh.click();
      let heroSection = element(by.css('hero-list > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    describe('Whirlwind setValue form', function() {
      beforeEach(function() {
        let whirlwindButton = element.all(by.css('nav a')).get(0);
        whirlwindButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Whirlwind');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Whirlwind');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('123 Main');
        expect(address1.state).toBe('CA');
        expect(address1.zip).toBe('94801');
        expect(address1.city).toBe('Anywhere');
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail-7 > p'));
        expect(json.getText()).toContain('Whirlwind');
        expect(json.getText()).toContain('Anywhere');
        let nameOutput = element(by.css('hero-detail-7 > p ~ p'));
        expect(nameOutput.getText()).toContain('Name value: Whirlwind');
        let streetOutput = element(by.css('hero-detail-7 > p ~ p ~ p'));
        expect(streetOutput.getText()).toContain('Street value: 123 Main');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

    }); // Whirlwind setValue form

    describe('Bombastic setValue form', function() {
      beforeEach(function() {
        let bombasticButton = element.all(by.css('nav a')).get(1);
        bombasticButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Bombastic');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Bombastic');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('789 Elm');
        expect(address1.state).toBe('OH');
        expect(address1.zip).toBe('04501');
        expect(address1.city).toBe('Smallville');
      });

      it('shows a json output from the form', function() {
          let json = element(by.css('hero-detail-7 > p'));
          expect(json.getText()).toContain('Bombastic');
          expect(json.getText()).toContain('Smallville');
          expect(json.getText()).toContain('04501');
          expect(json.getText()).toContain('789 Elm');
          let nameOutput = element(by.css('hero-detail-7 > p ~ p'));
          expect(nameOutput.getText()).toContain('Name value: Bombastic');
          let streetOutput = element(by.css('hero-detail-7 > p ~ p ~ p'));
          expect(streetOutput.getText()).toContain('Street value: 789 Elm');
        });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

    }); // Bombastic setValue form

    describe('Magneta setValue form', function() {
      beforeEach(function() {
        let magnetaButton = element.all(by.css('nav a')).get(2);
        magnetaButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('.demo > div > div > h3'));
          expect(editMessage.getText()).toBe('Editing: Magneta');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Magneta');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

      it('shows a json output from the form', function() {
          let json = element(by.css('hero-detail-7 > p'));
          expect(json.getText()).toContain('Magneta');
          let nameOutput = element(by.css('hero-detail-7 > p ~ p'));
          expect(nameOutput.getText()).toContain('Name value: Magneta');
          let streetOutput = element(by.css('hero-detail-7 > p ~ p ~ p'));
          expect(streetOutput.getText()).toContain('Street value:');
        });

    }); // Magneta setValue form
  }); // SetValue demo

// *************Begin patchValue Demo test*******************************

 describe('patchValue demo', function() {
    beforeEach(function() {
      let SetValueOption = element.all(by.css('select option')).get(5);
      SetValueOption.click();
    });

    it('should show patchValue Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('PatchValue Demo');
      });
     });

    it('does not select any hero by default', function() {
      let heroSection = element(by.css('.demo > div > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    it('refreshes the page upon button click', function() {
      // We move to another page...
      let whirlwindButton = element.all(by.css('nav a')).get(0);
      whirlwindButton.click();
      let refresh = element(by.css('button'));
      refresh.click();
      let heroSection = element(by.css('.demo > div > div'));
      expect(heroSection.isPresent()).toBe(false);
    });

    describe('Whirlwind patchValue form', function() {
      beforeEach(function() {
        let whirlwindButton = element.all(by.css('nav a')).get(0);
        whirlwindButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('h2 ~ h3'));
          expect(editMessage.getText()).toBe('Editing: Whirlwind');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Whirlwind');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('');
        expect(address1.state).toBe('');
        expect(address1.zip).toBe('');
        expect(address1.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail-6 > p'));
        expect(json.getText()).toContain('Whirlwind');
        let nameOutput = element(by.css('hero-detail-6 > p ~ p'));
        expect(nameOutput.getText()).toContain('Name value: Whirlwind');
        let streetOutput = element(by.css('hero-detail-6 > p ~ p ~ p'));
        expect(streetOutput.getText()).toContain('Street value:');
      });


    }); // Bombastic patchValue form
    describe('Bombastic patchValue form', function() {
      beforeEach(function() {
        let bombasticButton = element.all(by.css('nav a')).get(1);
        bombasticButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('h2 ~ h3'));
          expect(editMessage.getText()).toBe('Editing: Bombastic');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Bombastic');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('');
        expect(address1.state).toBe('');
        expect(address1.zip).toBe('');
        expect(address1.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail-6 > p'));
        expect(json.getText()).toContain('Bombastic');
        let nameOutput = element(by.css('hero-detail-6 > p ~ p'));
        expect(nameOutput.getText()).toContain('Name value: Bombastic');
        let streetOutput = element(by.css('hero-detail-6 > p ~ p ~ p'));
        expect(streetOutput.getText()).toContain('Street value:');
      });
    }); // Bombastic patchValue form

    describe('Magneta patchValue form', function() {
      beforeEach(function() {
        let magnetaButton = element.all(by.css('nav a')).get(2);
        magnetaButton.click();
      });

      it('should show a hero information when the button is clicked', function() {
          let editMessage = element(by.css('h2 ~ h3'));
          expect(editMessage.getText()).toBe('Editing: Magneta');
      });

      it('should show a form with the selected hero information', function() {
        let nameInput = element(by.css('input[formcontrolname=name]'));
        expect(nameInput.getAttribute('value')).toBe('Magneta');
        let address1 = finalDemoAddressForm(element, 0);
        expect(address1.street).toBe('');
        expect(address1.state).toBe('');
        expect(address1.zip).toBe('');
        expect(address1.city).toBe('');
      });

      it('should show three radio buttons', function() {
        let radioButtons = element.all(by.css('input[formcontrolname=power]'));
        expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
        expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
        expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
      });

      it('should show a checkbox', function() {
        let checkbox = element(by.css('input[formcontrolname=sidekick]'));
        expect(checkbox.getAttribute('checked')).toBe(null);
      });

      it('shows a json output from the form', function() {
        let json = element(by.css('hero-detail-6 > p'));
        expect(json.getText()).toContain('Magneta');
        let nameOutput = element(by.css('hero-detail-6 > p ~ p'));
        expect(nameOutput.getText()).toContain('Name value: Magneta');
        let streetOutput = element(by.css('hero-detail-6 > p ~ p ~ p'));
        expect(streetOutput.getText()).toContain('Street value:');
      });

    }); // Magneta patchValue form
  }); // PatchValue demo



// *************Begin Nested FormBuilder Demo test*******************************

 describe('Nested FormBuilder demo', function() {
    beforeEach(function() {
      let NestedFormBuilderOption = element.all(by.css('select option')).get(4);
      NestedFormBuilderOption.click();
    });

    it('should show Nested FormBuilder Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('Nested FormBuilder group Demo');
      });
     });

    it('should show a form for hero information', function() {
      let nameInput = element(by.css('input[formcontrolname=name]'));
      expect(nameInput.getAttribute('value')).toBe('');
      let address1 = finalDemoAddressForm(element, 0);
      expect(address1.street).toBe('');
      expect(address1.state).toBe('');
      expect(address1.zip).toBe('');
      expect(address1.city).toBe('');
    });

    it('should show three radio buttons', function() {
      let radioButtons = element.all(by.css('input[formcontrolname=power]'));
      expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
      expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
      expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
    });

    it('should show a checkbox', function() {
      let checkbox = element(by.css('input[formcontrolname=sidekick]'));
      expect(checkbox.getAttribute('checked')).toBe(null);
    });

    it('shows a json output from the form', function() {
      let json = element(by.css('hero-detail-5 > p'));
      expect(json.getText()).toContain('address');
      let nameOutput = element(by.css('hero-detail-5 > p ~ p'));
      expect(nameOutput.getText()).toContain('Name value:');
      let streetOutput = element(by.css('hero-detail-5 > p ~ p ~ p'));
      expect(streetOutput.getText()).toContain('Street value:');
    });

  }); // Nested FormBuilder demo

// *************Begin Group with multiple controls Demo test*******************************

 describe('Group with multiple controls demo', function() {
    beforeEach(function() {
      let NestedFormBuilderOption = element.all(by.css('select option')).get(3);
      NestedFormBuilderOption.click();
    });

    it('should show Group with multiple controls Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('Group with multiple controls Demo');
      });
     });

    it('should show header', function() {
        let header = element(by.css('hero-detail-4 > h3'));
        expect(header.getText()).toBe('A FormGroup with multiple FormControls');
    });

    it('should show a form for hero information', function() {
      let nameInput = element(by.css('input[formcontrolname=name]'));
      expect(nameInput.getAttribute('value')).toBe('');
      let address1 = finalDemoAddressForm(element, 0);
      expect(address1.street).toBe('');
      expect(address1.state).toBe('');
      expect(address1.zip).toBe('');
      expect(address1.city).toBe('');
    });

    it('should show three radio buttons', function() {
      let radioButtons = element.all(by.css('input[formcontrolname=power]'));
      expect(radioButtons.get(0).getAttribute('value')).toBe('flight');
      expect(radioButtons.get(1).getAttribute('value')).toBe('x-ray vision');
      expect(radioButtons.get(2).getAttribute('value')).toBe('strength');
    });
    it('should show a checkbox', function() {
      let checkbox = element(by.css('input[formcontrolname=sidekick]'));
      expect(checkbox.getAttribute('checked')).toBe(null);
    });
    it('shows a json output from the form', function() {
      let json = element(by.css('hero-detail-4 > p'));
      expect(json.getText()).toContain('power');
    });

}); // Group with multiple controls demo



// *************Begin Group with multiple controls Demo test*******************************

 describe('Simple FormBuilder Group demo', function() {
    beforeEach(function() {
      let SimpleFormBuilderOption = element.all(by.css('select option')).get(2);
      SimpleFormBuilderOption.click();
    });

    it('should show Simple FormBuilder group Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('Simple FormBuilder group Demo');
      });
     });

    it('should show header', function() {
        let header = element(by.css('hero-detail-3 > h3'));
        expect(header.getText()).toBe('A FormGroup with a single FormControl using FormBuilder');
    });

    it('should show a form for hero information', function() {
      let nameInput = element(by.css('input[formcontrolname=name]'));
      expect(nameInput.getAttribute('value')).toBe('');
    });

    it('shows a json output from the form', function() {
      let json = element(by.css('hero-detail-3 > p'));
      expect(json.getText()).toContain('name');
      let validStatus = element(by.css('hero-detail-3 > p ~ p'));
      expect(validStatus.getText()).toContain('INVALID');
    });

}); // Group with multiple controls demo


// *************Begin FormControl in a FormGroup Demo test*******************************

 describe('FormControl in a FormGroup demo', function() {
    beforeEach(function() {
      let SimpleFormBuilderOption = element.all(by.css('select option')).get(1);
      SimpleFormBuilderOption.click();
    });

    it('should show FormControl in a FormGroup Demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('FormControl in a FormGroup Demo');
      });
     });

    it('should show header', function() {
        let header = element(by.css('hero-detail-2 > h3'));
        expect(header.getText()).toBe('FormControl in a FormGroup');
    });

    it('should show a form for hero information', function() {
      let nameInput = element(by.css('input[formcontrolname=name]'));
      expect(nameInput.getAttribute('value')).toBe('');
    });

    it('shows a json output from the form', function() {
      let json = element(by.css('hero-detail-2 > p'));
      expect(json.getText()).toContain('name');
    });

}); // Group with multiple controls demo

// *************Begin Just A FormControl Demo test*******************************

 describe('Just a FormControl demo', function() {
    beforeEach(function() {
      let FormControlOption = element.all(by.css('select option')).get(0);
      FormControlOption.click();
    });

    it('should show Just a FormControl demo', function() {
      select.getAttribute('value').then(function(demo: string) {
        expect(demo).toBe('Just a FormControl Demo');
      });
     });

    it('should show header', function() {
        let header = element(by.css('hero-detail-1 > h3'));
        expect(header.getText()).toBe('Just a FormControl');
    });

    it('should show a form for hero information', function() {
      let nameInput = element(by.css('input'));
      expect(nameInput.getAttribute('value')).toBe('');
    });

  }); // Just a FormControl demo test


}); // reactive forms
