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
});
