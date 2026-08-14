import * as webdriver from 'selenium-webdriver';

/**
 * locate(parent, finder1, finder2) => parent.findElement(finder1).findElement(finder2);
 */
export async function locate(
  parent: webdriver.WebDriver | webdriver.WebElement,
  ...locators: webdriver.Locator[]
): Promise<webdriver.WebElement> {
  let current: webdriver.WebElement = await parent.findElement(locators[0]);
  for (let i = 1; i < locators.length; i++) {
    current = await current.findElement(locators[i]);
  }
  return current;
}

export async function sleepFor(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getLinkById(driver: webdriver.WebDriver, id: string) {
  return driver.findElement(webdriver.By.css(`a[id=${id}]`));
}
