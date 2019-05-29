///<reference path="e2e-spec.d.ts" />

'use strict';

import { browser, element, by } from 'protractor';

let matchers: any = {
  toHaveTextByCss: toHaveTextByCss,
  toHaveText: toHaveText,
  toContainText: toContainText,
  toHaveValue: toHaveValue,
  toBeSelected: toBeSelected,
  toBePresent: toBePresent,
  toBeDisplayed: toBeDisplayed,
  toHaveClass: toHaveClass
};

function toHaveTextByCss() {
  return {
    compare: function (cssSelector: string, expectedText: string): any {
      let ret: any = {
        pass: element.all(by.css(cssSelector)).first().getText().then(function (elementText) {
          if (elementText !== expectedText) {
            ret.message = 'Element by CSS "' + cssSelector + '" expected to have text: ' + expectedText;
          }
          return elementText === expectedText;
        })
      };
      return ret;
    }
  };
}

function toHaveText() {
  return {
    compare: function (element: any, expectedText: string): any {
      let ret: any = {
        pass: element.getText().then(function (elementText: string) {
          if (elementText !== expectedText) {
            ret.message = 'Element expected to have text: ' + expectedText;
          }
          return elementText === expectedText;
        })
      };
      return ret;
    }
  };
}

function toContainText() {
  return {
    compare: function (element: any, expectedText: string): any {
      let ret: any = {
        pass: element.getText().then(function (elementText: string) {
          if (elementText.indexOf(expectedText) === -1) {
            ret.message = 'Element expected to contain text: ' + expectedText;
          }
          return elementText.indexOf(expectedText) !== -1;
        })
      };
      return ret;
    }
  };
}

function toHaveValue() {
  return {
    compare: function (element: any, expectedValue: any): any {
      let ret: any = {
        pass: element.getAttribute('value').then(function (elementValue: any) {
          if (elementValue !== expectedValue) {
            ret.message = 'Element expected to have value: ' + expectedValue;
          }
          return elementValue === expectedValue;
        })
      };
      return ret;
    }
  };
}

function toBeSelected() {
  return {
    compare: function (element: any): any {
      let ret: any = {
        pass: element.isSelected().then(function (isSelected: boolean) {
          if (!isSelected) {
            ret.message = 'Element expected to be selected';
          }
          return isSelected === true;
        })
      };
      return ret;
    },
    negativeCompare: function (element: any) {
      let ret: any = {
        pass: element.isSelected().then(function (isSelected: boolean) {

          if (isSelected) {
            ret.message = 'Element expected not to be selected';
          }
          return isSelected === false;

        })
      };
      return ret;
    }
  };
}

function toBePresent() {
  return {
    compare: function (element: any) {
      let ret: any = {
        pass: element.isPresent().then(function (isPresent: boolean) {
          if (!isPresent) {
            ret.message = 'Element expected to be present';
          }
          return isPresent === true;
        })
      };
      return ret;
    },
    negativeCompare: function (element: any) {
      let ret: any = {
        pass: element.isPresent().then(function (isPresent: boolean) {

          if (isPresent) {
            ret.message = 'Element expected not to be present';
          }
          return isPresent === false;

        })
      };
      return ret;
    }
  };
}

function toBeDisplayed() {
  return {
    compare: function (element: any) {
      let ret: any = {
        pass: element.isDisplayed().then(function (isDisplayed: boolean) {
          if (!isDisplayed) {
            ret.message = 'Element expected to be displayed';
          }
          return isDisplayed === true;
        })
      };
      return ret;
    },
    negativeCompare: function (element: any) {
      let ret: any = {
        pass: element.isDisplayed().then(function (isDisplayed: boolean) {

          if (isDisplayed) {
            ret.message = 'Element expected not to be displayed';
          }
          return isDisplayed === false;

        })
      };
      return ret;
    }
  };
}

function toHaveClass() {
  return {

    compare: function (element: any, expectedClass: string) {
      let ret: any = {
        pass: element.getAttribute('class').then(function (actualClasses: string) {

          let index = actualClasses.indexOf(expectedClass);

          if (index === -1) {
            ret.message = 'Expected to have class ' + expectedClass;
          }

          return index !== -1;

        })
      };
      return ret;
    },

    negativeCompare: function (element: any, forbiddenClass: string) {
      let ret: any = {
        pass: element.getAttribute('class').then(function (actualClasses: string) {

          let index = actualClasses.indexOf(forbiddenClass);

          if (index !== -1) {
            ret.message = 'Expected not to have class ' + forbiddenClass;
          }

          return index === -1;

        })
      };
      return ret;
    }

  };

}

describe('A11y Cookbook', function() {

  beforeEach(function() {
    jasmine.addMatchers(matchers);
  });

  describe('A11y Cookbook main index', function() {

    beforeAll(function() {
      browser.get('');
    });

    it('should display the main heading and links', function() {
      expect('h1').toHaveTextByCss('Angular a11y cookbook');
      expect(element.all(by.tagName('a')).get(0)).toHaveText('Accessible form control labels');
      expect(element.all(by.tagName('a')).get(1)).toHaveText('Managing focus');
      expect(element.all(by.tagName('a')).get(2)).toHaveText('Roles for custom component widgets');
      expect(element.all(by.tagName('a')).get(3)).toHaveText('Developer tools');
    });

    it('should display the dev tool deeplinks', function() {
      element.all(by.tagName('a')).get(3).click();
      expect(element.all(by.tagName('a')).get(0)).toHaveText('Demo with a11y errors');
      expect(element.all(by.tagName('a')).get(1)).toHaveText('Demo with full a11y features');
    });

  });

  describe('A11y Cookbook control labels', function() {

    beforeAll(function() {
      browser.get('');
      element.all(by.tagName('a')).get(0).click();
    });

    it('should have the correct page heading', function() {
      expect('h2').toHaveTextByCss('Accessible form control labels');
    });

    it('should have the correct sections', function() {
      let headings = element.all(by.tagName('h3'));
      expect(headings.get(0)).toHaveText('Implicit labeling');
      expect(headings.get(1)).toHaveText('Explicit labeling');
      expect(headings.get(2)).toHaveText('Hiding labels');
      expect(headings.get(3)).toHaveText('Labeling custom controls');
    });

    it('should have a working implicitly labelled input', function() {
      let testVal = 'Some text';
      expect(element.all(by.tagName('label')).get(0)).toHaveText('First name:');
      let input = element.all(by.css('label > input')).first();
      expect(input).toHaveValue('');
      input.sendKeys(testVal);
      expect(input).toHaveValue(testVal);
      testValueDecorator(0, testVal);
    });

    it('should have a working implicitly labelled textarea', function() {
      let testVal = 'Some text';
      expect(element.all(by.tagName('label')).get(1)).toHaveText('Comments:');
      let textarea = element.all(by.css('label > textarea')).first();
      expect(textarea).toHaveValue('');
      textarea.sendKeys(testVal);
      expect(textarea).toHaveValue(testVal);
      testValueDecorator(1, testVal);
    });

    it('should have working implicitly labelled checkboxes', function() {
      expect('fieldset legend').toHaveTextByCss('What do you like most about Angular 2?');
      let fieldSet = element.all(by.css('fieldset')).first();
      expect(fieldSet.all(by.css('label')).get(0)).toHaveText('Template syntax');
      expect(fieldSet.all(by.css('label')).get(1)).toHaveText('Observables');
      expect(fieldSet.all(by.css('label')).get(2)).toHaveText('Components');
      expect(fieldSet.all(by.css('label')).get(3)).toHaveText('Forms');
      expect(fieldSet.all(by.css('input')).get(0)).not.toBeSelected();
      expect(fieldSet.all(by.css('input')).get(1)).toBeSelected();
      expect(fieldSet.all(by.css('input')).get(2)).toBeSelected();
      expect(fieldSet.all(by.css('input')).get(3)).not.toBeSelected();
      testValueDecorator(2, '[ "Observables", "Components" ]');
      fieldSet.all(by.css('input')).get(1).click();
      testValueDecorator(2, '[ "Components" ]');
      fieldSet.all(by.css('input')).get(0).click();
      testValueDecorator(2, '[ "Components", "Template syntax" ]');
    });

    it('should have working implicitly labelled radiobuttons', function() {
      expect(element.all(by.css('fieldset legend')).get(1)).toHaveText('Choose your favourite Angular 2 language:');
      let fieldSet = element.all(by.css('fieldset')).get(1);
      expect(fieldSet.all(by.css('label')).get(0)).toHaveText('TypeScript');
      expect(fieldSet.all(by.css('label')).get(1)).toHaveText('JavaScript');
      expect(fieldSet.all(by.css('label')).get(2)).toHaveText('ES6');
      expect(fieldSet.all(by.css('label')).get(3)).toHaveText('Dart');
      expect(fieldSet.all(by.css('input')).get(0)).toBeSelected();
      expect(fieldSet.all(by.css('input')).get(1)).not.toBeSelected();
      expect(fieldSet.all(by.css('input')).get(2)).not.toBeSelected();
      expect(fieldSet.all(by.css('input')).get(3)).not.toBeSelected();
      testValueDecorator(3, 'TypeScript');
      fieldSet.all(by.css('label')).get(1).click();
      testValueDecorator(3, 'JavaScript');
    });

    it('should have a working implicitly labelled select', function() {
      expect(element.all(by.tagName('label')).get(10)).toContainText('Why are you interested in a11y?');
      expect(element.all(by.tagName('select')).get(0)).toHaveValue('Curiosity');
      testValueDecorator(4, 'Curiosity');
    });

    it('should have a working explicitly labelled input', function() {
      let testVal = 'Some text';
      expect(element.all(by.tagName('label[for="inputexplicit"]')).first()).toHaveText('Label for input:');
      let input = element.all(by.css('#inputexplicit')).get(0);
      expect(input).toHaveValue('');
      input.sendKeys(testVal);
      expect(input).toHaveValue(testVal);
      testValueDecorator(5, testVal);
    });

    it('should have a working input with hidden label', function() {
      let testVal = 'Some text';
      expect(element.all(by.tagName('label.visually-hidden')).first()).toHaveText('Search:');
      let input = element.all(by.css('#inputsearch')).first();
      expect(input).toHaveValue('');
      input.sendKeys(testVal);
      expect(input).toHaveValue(testVal);
      testValueDecorator(6, testVal);
    });

    it('should have a working input with aria-label', function() {
      let testVal = 'Some text';
      let input = element.all(by.css('input[aria-label="Search:"')).first();
      expect(input).toHaveValue('');
      input.sendKeys(testVal);
      expect(input).toHaveValue(testVal);
      testValueDecorator(7, testVal);
    });

    it('should have a working editable div with label', function() {
      let testVal = 'Value';
      expect(element.all(by.tagName('div.col-xs-6 label')).first()).toHaveText('Write in this labeled div:');
      let input = element.all(by.css('div.col-xs-6 div.edit-box')).first();
      expect(input).toHaveText('');
      input.sendKeys(testVal);
      expect(input).toHaveText(testVal);
    });

    it('should have a working wrapped input', function() {
      let testVal = 'Test';
      expect(element.all(by.tagName('div.col-xs-6 label span')).first()).toHaveText('Write in this wrapped input:');
      let input = element.all(by.css('div.input-group input')).first();
      expect(input).toHaveValue('');
      input.sendKeys(testVal);
      expect(input).toHaveValue(testVal);
    });

  });

  describe('A11y Cookbook managing focus', function() {

    beforeAll(function() {
      browser.get('');
      element.all(by.tagName('a')).get(1).click();
    });

    it('should have the correct page heading', function() {
      expect('h2').toHaveTextByCss('Managing focus');
    });

    it('should have the correct sections', function() {
      let headings = element.all(by.tagName('h3'));
      expect(headings.get(0)).toHaveText('The focus outline');
      expect(headings.get(1)).toHaveText('Focus flow');
      expect(headings.get(2)).toHaveText('Focusing custom controls');
      expect(headings.get(3)).toHaveText('Internal focus in a component');
    });

    it('should have the focus outline elements', function() {
      expect(element.all(by.cssContainingText('label', 'Focus me for the standard browser outline:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'Focus me for a new and unusual outline:')).first()).toBePresent();
    });

    it('should have the focus flow elements', function() {
      expect(element.all(by.cssContainingText('label', 'Which city of The USA did you work in:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'How many months did you work in The USA:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'Which city of The Netherlands did you work in:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'How many months did you work in The Netherlands:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'Which city of South Africa did you work in:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'How many months did you work in South Africa:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'Which city of Germany did you work in:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'How many months did you work in Germany:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'Which city of The UK did you work in:')).first()).toBePresent();
      expect(element.all(by.cssContainingText('label', 'How many months did you work in The UK:')).first()).toBePresent();
    });

    it('should have a clickable custom button component', function() {
      element.all(by.tagName('app-custom-button')).get(0).click();
      testValueDecorator(0, 'Button has been clicked 1 times');
    });

    it('should have an error toggling component', function() {
      let showErrorButton = element(by.css('app-error-demo button.btn.btn-primary'));
      expect(showErrorButton).toHaveText('Show error');
      let errorBanner = element(by.css('app-error-demo div.alert'));
      expect(errorBanner).not.toBeDisplayed();
      showErrorButton.click();
      expect(errorBanner).toBeDisplayed();
      element(by.css('app-error-demo button.close')).click();
      expect(errorBanner).not.toBeDisplayed();
    });

  });

  describe('A11y Cookbook roles for custom components', function() {

    beforeAll(function() {
      browser.get('');
      element.all(by.tagName('a')).get(2).click();
    });

    it('should have the correct page heading', function() {
      expect('h2').toHaveTextByCss('Roles for custom component widgets');
    });

    it('should have the correct sections', function() {
      let headings = element.all(by.tagName('h3'));
      expect(headings.get(0)).toHaveText('Roles in the template');
      expect(headings.get(1)).toHaveText('Roles of the host element');
    });

    it('should have a working editable div with label and internal role', function() {
      let testVal = 'Test';
      expect(element.all(by.tagName('div.col-xs-6 label')).first()).toHaveText('I set the role in my template:');
      let input = element.all(by.css('div[role="textbox"]')).get(0);
      expect(input).toHaveText('');
      input.sendKeys(testVal);
      expect(input).toHaveText(testVal);
    });

    it('should have a clickable custom button component with role', function() {
      element.all(by.css('app-custom-button[role="button"]')).get(0).click();
      testValueDecorator(1, 'Button has been clicked 1 times');
    });

  });

  describe('A11y Cookbook a11y errors page', function() {

    beforeAll(function() {
      browser.get('');
      element.all(by.tagName('a')).get(3).click();
      element.all(by.tagName('a')).first().click();
    });

    it('should have the correct page heading', function() {
      expect('h3').toHaveTextByCss('Demo with a11y errors');
    });

    it('should have the required form elements', function() {
      testDemoPageLabels();
    });

    it('should have basic form functionality', function() {
      testDemoPageFunction();
    });

  });

  describe('A11y Cookbook a11y features page', function() {

    beforeAll(function() {
      browser.get('');
      element.all(by.tagName('a')).get(3).click();
      element.all(by.tagName('a')).get(1).click();
    });

    it('should have the correct page heading', function() {
      expect('h2').toHaveTextByCss('Demo with full a11y features');
    });

    it('should have the required form elements', function() {
      testDemoPageLabels();
    });

    it('should have basic form functionality', function() {
      testDemoPageFunction();
    });

  });

  function testDemoPageLabels() {
    expect(element.all(by.cssContainingText('label', 'Your name:')).first()).toBePresent();
    expect(element.all(by.cssContainingText('label', 'Your surname:')).first()).toBePresent();
    expect(element.all(by.cssContainingText('label', 'Tell us why you love Angular:')).first()).toBePresent();
    expect(element.all(by.cssContainingText('button', 'Submit')).first()).toBePresent();
  }

  function testDemoPageFunction() {
    let statusBanner = element(by.css('div.alert.alert-success'));
    let submitButton = element(by.css('button.btn.btn-primary'));
    expect(statusBanner).not.toBeDisplayed();
    let nameInput = element.all(by.css('input')).get(0);
    nameInput.sendKeys('John');
    let surnameInput = element.all(by.css('input')).get(1);
    surnameInput.sendKeys('Smith');
    let reasonInput = element.all(by.css('input')).get(2);
    reasonInput.sendKeys('It is awesome!!');
    submitButton.click();
    expect(statusBanner).toBeDisplayed();
    expect(element.all(by.cssContainingText('div.alert.alert-success',
      'Hi John Smith! Your reason for liking Angular is: It is awesome!!.')).first()).toBePresent();
  }

  function testValueDecorator(index: number, contentText: string) {
    let decorator = element.all(by.css('app-value-helper span')).get(index);
    expect(decorator).toHaveText('Current value: ' + contentText);
  }

});
