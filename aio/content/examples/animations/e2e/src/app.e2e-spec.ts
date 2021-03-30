import { browser } from 'protractor';
import { logging } from 'selenium-webdriver';
import * as openClose from './open-close.po';
import * as statusSlider from './status-slider.po';
import * as toggle from './toggle.po';
import * as enterLeave from './enter-leave.po';
import * as auto from './auto.po';
import * as filterStagger from './filter-stagger.po';
import * as heroGroups from './hero-groups';
import { getLinkById, sleepFor } from './util';

describe('Animation Tests', () => {
  const openCloseHref = getLinkById('open-close');
  const statusSliderHref = getLinkById('status');
  const toggleHref = getLinkById('toggle');
  const enterLeaveHref = getLinkById('enter-leave');
  const autoHref = getLinkById('auto');
  const filterHref = getLinkById('heroes');
  const heroGroupsHref = getLinkById('hero-groups');

  beforeAll(() => browser.get(''));

  describe('Open/Close Component', () => {
    const closedHeight = '100px';
    const openHeight = '200px';

    beforeAll(async () => {
      await openCloseHref.click();
      await sleepFor();
    });

    it('should be open', async () => {
      const toggleButton = openClose.getToggleButton();
      const container = openClose.getComponentContainer();
      let text = await container.getText();

      if (text.includes('Closed')) {
        await toggleButton.click();
        await browser.wait(async () => await container.getCssValue('height') === openHeight, 2000);
      }

      text = await container.getText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Open!');
      expect(containerHeight).toBe(openHeight);
    });

    it('should be closed', async () => {
      const toggleButton = openClose.getToggleButton();
      const container = openClose.getComponentContainer();
      let text = await container.getText();

      if (text.includes('Open')) {
        await toggleButton.click();
        await browser.wait(async () => await container.getCssValue('height') === closedHeight, 2000);
      }

      text = await container.getText();
      const containerHeight = await container.getCssValue('height');

      expect(text).toContain('The box is now Closed!');
      expect(containerHeight).toBe(closedHeight);
    });

    it('should log animation events', async () => {
      const toggleButton = openClose.getToggleButton();
      const loggingCheckbox = openClose.getLoggingCheckbox();
      await loggingCheckbox.click();
      await toggleButton.click();

      const logs = await browser.manage().logs().get(logging.Type.BROWSER);
      const animationMessages = logs.filter(({ message }) => message.includes('Animation'));

      expect(animationMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Status Slider Component', () => {
    const activeColor = 'rgba(117, 70, 0, 1)';
    const inactiveColor = 'rgba(0, 0, 255, 1)';

    beforeAll(async () => {
      await statusSliderHref.click();
      await sleepFor(2000);
    });

    it('should be inactive with a blue background', async () => {
      const toggleButton = statusSlider.getToggleButton();
      const container = statusSlider.getComponentContainer();
      let text = await container.getText();

      if (text === 'Active') {
        await toggleButton.click();
        await browser.wait(async () => await container.getCssValue('backgroundColor') === inactiveColor, 3000);
      }

      text = await container.getText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Inactive');
      expect(bgColor).toBe(inactiveColor);
    });

    it('should be active with an orange background', async () => {
      const toggleButton = statusSlider.getToggleButton();
      const container = statusSlider.getComponentContainer();
      let text = await container.getText();

      if (text === 'Inactive') {
        await toggleButton.click();
        await browser.wait(async () => await container.getCssValue('backgroundColor') === activeColor, 3000);
      }

      text = await container.getText();
      const bgColor = await container.getCssValue('backgroundColor');

      expect(text).toBe('Active');
      expect(bgColor).toBe(activeColor);
    });
  });

  describe('Toggle Animations Component', () => {
    beforeAll(async () => {
      await toggleHref.click();
      await sleepFor();
    });

    it('should disabled animations on the child element', async () => {
      const toggleButton = toggle.getToggleAnimationsButton();

      await toggleButton.click();

      const container = toggle.getComponentContainer();
      const cssClasses = await container.getAttribute('class');

      expect(cssClasses).toContain('ng-animate-disabled');
    });
  });

  describe('Enter/Leave Component', () => {
    beforeAll(async () => {
      await enterLeaveHref.click();
      await sleepFor(100);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = enterLeave.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = enterLeave.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await browser.wait(async () => await heroesList.count() < total, 2000);
    });
  });

  describe('Auto Calculation Component', () => {
    beforeAll(async () => {
      await autoHref.click();
      await sleepFor(0);
    });

    it('should attach a shrinkOut trigger to the list of items', async () => {
      const heroesList = auto.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-shrinkOut');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = auto.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await browser.wait(async () => await heroesList.count() < total, 2000);
    });
  });

  describe('Filter/Stagger Component', () => {
    beforeAll(async () => {
      await filterHref.click();
      await sleepFor();
    });

    it('should attach a filterAnimations trigger to the list container', async () => {
      const heroesList = filterStagger.getComponentContainer();
      const cssClasses = await heroesList.getAttribute('class');

      expect(cssClasses).toContain('ng-trigger-filterAnimation');
    });

    it('should filter down the list when a search is performed', async () => {
      const heroesList = filterStagger.getHeroesList();
      const total = await heroesList.count();

      const formInput = filterStagger.getFormInput();
      await formInput.sendKeys('Mag');

      await browser.wait(async () => await heroesList.count() === 2, 2000);

      const newTotal = await heroesList.count();
      expect(newTotal).toBeLessThan(total);
    });
  });

  describe('Hero Groups Component', () => {
    beforeAll(async () => {
      await heroGroupsHref.click();
      await sleepFor(300);
    });

    it('should attach a flyInOut trigger to the list of items', async () => {
      const heroesList = heroGroups.getHeroesList();
      const hero = heroesList.get(0);
      const cssClasses = await hero.getAttribute('class');
      const transform = await hero.getCssValue('transform');
      const opacity = await hero.getCssValue('opacity');

      expect(cssClasses).toContain('ng-trigger-flyInOut');
      expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)');
      expect(opacity).toBe('1');
    });

    it('should remove the hero from the list when clicked', async () => {
      const heroesList = heroGroups.getHeroesList();
      const total = await heroesList.count();
      const hero = heroesList.get(0);

      await hero.click();
      await browser.wait(async () => await heroesList.count() < total, 2000);
    });
  });
});
