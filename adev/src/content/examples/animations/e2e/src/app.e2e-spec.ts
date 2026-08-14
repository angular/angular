import * as webdriver from 'selenium-webdriver';
import * as openClose from './open-close.po';
import * as statusSlider from './status-slider.po';
import * as toggle from './toggle.po';
import * as enterLeave from './enter-leave.po';
import * as auto from './auto.po';
import * as filterStagger from './filter-stagger.po';
import * as heroGroups from './hero-groups';
import {getLinkById, sleepFor} from './util';
import {getComponentSection, getToggleButton} from './querying.po';

describe('Animation Tests', () => {
  let driver: webdriver.WebDriver;
  const routingAnimationDuration = 350;

  const newPageSleepFor = (ms = 0) => sleepFor(ms + routingAnimationDuration);

  beforeAll(async () => {
    await driver.get('');
  });

  describe('Open/Close Component', () => {
    const closedHeight = '100px';
    const openHeight = '200px';

    beforeAll(async () => {
      await (await getLinkById(driver, 'open-close')).click();
      await newPageSleepFor(300);
    });

    it('should be open', async () => {
      const toggleButton = await openClose.getToggleButton(driver);
      const container = await openClose.getComponentContainer(driver);
      let text = await container.getText();

      if (text.includes('Closed')) {
        await toggleButton.click();
        await driver.wait(async () => (await container.getCssValue('height')) === openHeight, 2000);
      }

      text = await container.getText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Open!');
      expect(containerHeight).toBe(openHeight);
    });

    it('should be closed', async () => {
      const toggleButton = await openClose.getToggleButton(driver);
      const container = await openClose.getComponentContainer(driver);
      let text = await container.getText();

      if (text.includes('Open')) {
        await toggleButton.click();
        await driver.wait(
          async () => (await container.getCssValue('height')) === closedHeight,
          2000,
        );
      }

      text = await container.getText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Closed!');
      expect(containerHeight).toBe(closedHeight);
    });

    it('should log animation events', async () => {
      const toggleButton = await openClose.getToggleButton(driver);
      const loggingCheckbox = await openClose.getLoggingCheckbox(driver);
      await loggingCheckbox.click();
      await toggleButton.click();

      const logs = await driver.manage().logs().get(webdriver.logging.Type.BROWSER);
      const animationMessages = logs.filter(({message}) => message.includes('Animation'));

      expect(animationMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Status Slider Component', () => {
    const activeColor = 'rgba(117, 70, 0, 1)';
    const inactiveColor = 'rgba(0, 0, 255, 1)';

    beforeAll(async () => {
      await (await getLinkById(driver, 'status')).click();
      await newPageSleepFor(2000);
    });

    it('should be inactive with a blue background', async () => {
      const toggleButton = await statusSlider.getToggleButton(driver);
      const container = await statusSlider.getComponentContainer(driver);
      let text = await container.getText();

      if (text === 'Active') {
        await toggleButton.click();
        await driver.wait(
          async () => (await container.getCssValue('backgroundColor')) === inactiveColor,
          3000,
        );
      }

      text = await container.getText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Inactive');
      expect(bgColor).toBe(inactiveColor);
    });

    it('should be active with an orange background', async () => {
      const toggleButton = await statusSlider.getToggleButton(driver);
      const container = await statusSlider.getComponentContainer(driver);
      let text = await container.getText();

      if (text === 'Inactive') {
        await toggleButton.click();
        await driver.wait(
          async () => (await container.getCssValue('backgroundColor')) === activeColor,
          3000,
        );
      }

      text = await container.getText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Active');
      expect(bgColor).toBe(activeColor);
    });
  });

  describe('Toggle Animations Component', () => {
    beforeAll(async () => {
      await (await getLinkById(driver, 'toggle')).click();
      await newPageSleepFor();
    });

    it('should disabled animations on the child element', async () => {
      const toggleButton = await toggle.getToggleAnimationsButton(driver);

      await toggleButton.click();

      const container = await toggle.getComponentContainer(driver);
      const cssClasses = await container.getAttribute('class');

      expect(cssClasses).toContain('ng-animate-disabled');
    });
  });

  describe('Enter/Leave Component', () => {
    beforeAll(async () => {
      await (await getLinkById(driver, 'enter-leave')).click();
      await newPageSleepFor(100);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = await enterLeave.getHeroesList(driver);
      const hero = heroesList[0];
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = await enterLeave.getHeroesList(driver);
      const total = heroesList.length;
      const hero = heroesList[0];

      await hero.click();
      await driver.wait(async () => (await enterLeave.getHeroesList(driver)).length < total, 2000);
    });
  });

  describe('Auto Calculation Component', () => {
    beforeAll(async () => {
      await (await getLinkById(driver, 'auto')).click();
      await newPageSleepFor();
    });

    it('should attach a shrinkOut trigger to the list of items', async () => {
      const heroesList = await auto.getHeroesList(driver);
      const hero = heroesList[0];
      const cssClasses = await hero.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-shrinkOut');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = await auto.getHeroesList(driver);
      const total = heroesList.length;
      const hero = heroesList[0];

      await hero.click();
      await driver.wait(async () => (await auto.getHeroesList(driver)).length < total, 2000);
    });
  });

  describe('Filter/Stagger Component', () => {
    beforeAll(async () => {
      await (await getLinkById(driver, 'heroes')).click();
      await newPageSleepFor();
    });

    it('should attach a filterAnimations trigger to the list container', async () => {
      const heroesList = await filterStagger.getComponentContainer(driver);
      const cssClasses = await heroesList.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-filterAnimation');
    });

    it('should filter down the list when a search is performed', async () => {
      const heroesList = await filterStagger.getHeroesList(driver);
      const total = heroesList.length;

      const input = await filterStagger.getInput(driver);
      await input.sendKeys('Mag');

      await driver.wait(async () => (await filterStagger.getHeroesList(driver)).length === 2, 2000);

      const newTotal = (await filterStagger.getHeroesList(driver)).length;
      expect(newTotal).toBeLessThan(total);
    });
  });

  describe('Hero Groups Component', () => {
    beforeAll(async () => {
      await (await getLinkById(driver, 'hero-groups')).click();
      await newPageSleepFor(400);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = await heroGroups.getHeroesList(driver);
      const hero = heroesList[0];
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');
      const opacity = await hero.getCssValue('opacity');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      expect(opacity).toBe('1');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = await heroGroups.getHeroesList(driver);
      const total = heroesList.length;
      const hero = heroesList[0];

      await hero.click();
      await driver.wait(async () => (await heroGroups.getHeroesList(driver)).length < total, 2000);
    });
  });

  describe('Querying Component', () => {
    const queryingAnimationDuration = 2500;

    beforeAll(async () => {
      await (await getLinkById(driver, 'querying')).click();
      await newPageSleepFor(queryingAnimationDuration);
    });

    it('should toggle the section', async () => {
      const toggleButton = await getToggleButton(driver);
      const section = await getComponentSection(driver);

      expect(await section.isDisplayed()).toBe(true);

      // toggling off
      await toggleButton.click();
      await newPageSleepFor(queryingAnimationDuration);
      const sectionsOff = await driver.findElements(webdriver.By.css('app-querying section'));
      expect(sectionsOff.length).toBe(0);

      // toggling on
      await toggleButton.click();
      await newPageSleepFor(queryingAnimationDuration);
      const sectionsOn = await driver.findElements(webdriver.By.css('app-querying section'));
      expect(sectionsOn.length).toBe(1);
      await newPageSleepFor(queryingAnimationDuration);
    });

    it(`should disable the button for the animation's duration`, async () => {
      const toggleButton = await getToggleButton(driver);
      expect(await toggleButton.isEnabled()).toBe(true);

      // toggling off
      await toggleButton.click();
      expect(await toggleButton.isEnabled()).toBe(false);
      await newPageSleepFor(queryingAnimationDuration);
      expect(await toggleButton.isEnabled()).toBe(true);

      // toggling on
      await toggleButton.click();
      expect(await toggleButton.isEnabled()).toBe(false);
      await newPageSleepFor(queryingAnimationDuration);
      expect(await toggleButton.isEnabled()).toBe(true);
    });
  });
});
