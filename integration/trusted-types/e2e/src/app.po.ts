import * as webdriver from 'selenium-webdriver';

export class AppPage {
  constructor(
    private driver: webdriver.WebDriver,
    private baseUrl: string,
  ) {}

  async navigateTo(): Promise<void> {
    await this.driver.get(this.baseUrl);
  }

  async switchToIframe(): Promise<void> {
    const el = await this.driver.findElement(webdriver.By.id('trusted-types-iframe'));
    await this.driver.switchTo().frame(el);
  }

  async switchToObject(): Promise<void> {
    const el = await this.driver.findElement(webdriver.By.id('trusted-types-object'));
    await this.driver.switchTo().frame(el);
  }

  async switchToEmbed(): Promise<void> {
    const el = await this.driver.findElement(webdriver.By.id('trusted-types-embed'));
    await this.driver.switchTo().frame(el);
  }

  async switchToDefaultContent(): Promise<void> {
    await this.driver.switchTo().defaultContent();
  }

  async getTitleText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('app-root .content span')).getText();
  }

  async getBoundHtmlText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('#bound-html span')).getText();
  }

  async getBoundSafeHtmlText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('#bound-safehtml span')).getText();
  }

  async getOuterHTMLText(): Promise<string> {
    return this.driver.findElement(webdriver.By.id('outerhtml')).getText();
  }

  async boundHtmlIframeIsPresent(): Promise<boolean> {
    const els = await this.driver.findElements(webdriver.By.id('bound-html-iframe'));
    return els.length > 0;
  }

  async boundSafeHtmlIframeIsPresent(): Promise<boolean> {
    const els = await this.driver.findElements(webdriver.By.id('bound-safehtml-iframe'));
    return els.length > 0;
  }

  async getHeaderText(): Promise<string> {
    return this.driver.findElement(webdriver.By.css('h1')).getText();
  }
}
