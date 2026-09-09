import * as webdriver from 'selenium-webdriver';

export class AppPage {
  constructor(
    private driver: webdriver.WebDriver,
    private baseUrl: string,
  ) {}

  async navigateTo(): Promise<void> {
    await this.driver.get(this.baseUrl);
  }

  async getGreetText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('.greet-text')).getText();
  }

  async getUnboundLastNameGreetText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('.unbound-last-name .greet-text')).getText();
  }

  async setLastName(): Promise<void> {
    await this.driver.findElement(webdriver.By.css('.set-last-name-btn')).click();
  }

  async unsetLastName(): Promise<void> {
    await this.driver.findElement(webdriver.By.css('.unset-last-name-btn')).click();
  }

  async getGreetCount(): Promise<string> {
    return this.driver.findElement(webdriver.By.id('greet-count')).getText();
  }
}
