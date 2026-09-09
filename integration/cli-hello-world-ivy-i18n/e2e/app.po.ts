import * as webdriver from 'selenium-webdriver';

export class AppPage {
  constructor(
    private driver: webdriver.WebDriver,
    private baseUrl: string,
  ) {}

  async navigateTo(): Promise<void> {
    await this.driver.get(this.baseUrl);
  }

  async getHeading(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('app-root h1')).getText();
  }

  async getParagraph(name: string): Promise<string> {
    return this.driver.findElement(webdriver.By.css('app-root p#' + name)).getText();
  }
}
