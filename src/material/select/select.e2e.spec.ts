import {browser, by, element, ExpectedConditions} from 'protractor';
import {getElement} from '../../cdk/testing/private/e2e';

const presenceOf = ExpectedConditions.presenceOf;
const not = ExpectedConditions.not;

describe('select', () => {
  beforeEach(async () => await browser.get('/select?animations=true'));

  // Regression test which ensures that ripples within the select are not persisted
  // accidentally. This could happen because the select panel is removed from DOM
  // immediately when an option is clicked. Usually ripples still fade-in at that point.
  it('should not accidentally persist ripples', async () => {
    const select = getElement('.mat-select');
    const options = element.all(by.css('.mat-option'));
    const ripples = element.all(by.css('.mat-ripple-element'));

    // Wait for select to be rendered.
    await browser.wait(presenceOf(select));

    // Opent the select and wait for options to be displayed.
    await select.click();
    await browser.wait(presenceOf(options.get(0)));

    // Click the first option and wait for the select to be closed.
    await options.get(0).click();
    await browser.wait(not(presenceOf(options.get(0))));

    // Re-open the select and wait for it to be rendered.
    await select.click();
    await browser.wait(presenceOf(options.get(0)));

    // Expect no ripples to be showing up without an option click.
    expect(await ripples.isPresent()).toBe(false);
  });
});
