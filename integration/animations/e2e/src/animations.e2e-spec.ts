import puppeteer, {Browser, Page} from 'puppeteer';

describe('Animations Integration', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // watch it run in the browser
      executablePath: process.env.CHROME_BIN,
      args: ['--no-sandbox', '--disable-gpu'],
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    // Use a retry loop to wait for ng serve to be fully ready
    for (let i = 0; i < 10; i++) {
      try {
        await page.goto('http://localhost:4208/');
        break;
      } catch (e) {
        if (i === 9) throw e;
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  it('should not disappear items when rearranged', async () => {
    // Wait for the elements to be rendered
    await page.waitForSelector('.example-box');

    const boxes = await page.$$('.example-box');
    expect(boxes.length).toBe(3);

    // Get the bounding boxes of the first and last elements
    const firstBox = await boxes[0]!.boundingBox();
    const lastBox = await boxes[2]!.boundingBox();

    if (!firstBox || !lastBox) {
      throw new Error('Could not find bounding boxes for elements.');
    }

    // Perform drag and drop
    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();

    // Smoothly drag it down to the last position
    await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height / 2 + 20, {
      steps: 50,
    });

    // Drop
    await page.mouse.up();

    // Wait for animations to finish (2000ms + some buffer)
    await new Promise((res) => setTimeout(res, 3000));

    // Check that we still have 3 items
    const finalBoxes = await page.$$('.example-box');
    expect(finalBoxes.length).toBe(3);
  });

  it('should remove element when animationend is dropped (fallback timeout)', async () => {
    // Wait for the fallback element to be rendered
    await page.waitForSelector('.fallback-el');

    let fallbackEls = await page.$$('.fallback-el');
    expect(fallbackEls.length).toBe(1);

    // Click the hide and intercept button
    await page.click('#hide-and-intercept');

    // Wait for fallback to kick in (animation is 50ms, fallback is duration + 50ms)
    // We give it a small buffer to ensure the timeout fires
    await new Promise((res) => setTimeout(res, 300));

    // Check that we have 0 items
    fallbackEls = await page.$$('.fallback-el');
    expect(fallbackEls.length).toBe(0);
  });

  it('should immediately remove routed component without waiting for its inner component leave animations', async () => {
    // Navigate to the nested route
    await page.click('#nested-link');
    await page.waitForSelector('.nested-parent');

    let childEls = await page.$$('.child-target');
    expect(childEls.length).toBe(2);

    // Trigger a route navigation back to home
    await page.click('#home-link');

    // Given the child animation is 800ms long, if we don't wait for it across component boundaries,
    // the previous component should be destroyed almost immediately.
    // Wait just a short amount (100ms) and verify the nested component and its children are completely gone.
    await new Promise((res) => setTimeout(res, 100));

    childEls = await page.$$('.child-target');
    expect(childEls.length).toBe(
      0,
      'Nested child component should have been removed immediately during routing',
    );
  });
});
