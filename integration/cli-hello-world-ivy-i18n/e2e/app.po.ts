import * as webdriver from 'selenium-webdriver';

export class AppPage {
  private driver: webdriver.WebDriver;
  private baseUrl: string;

  constructor(driver: webdriver.WebDriver, baseUrl: string) {
    this.driver = driver;
    this.baseUrl = baseUrl;
  }

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
