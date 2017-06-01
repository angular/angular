import {browser, by, element, protractor} from 'protractor';

export class HarnessPageObject {
  
  sendKeysSlow(el, keys) {
    keys.split('').forEach(char => el.sendKeys(char));
  }
  
  selectAction(action: string) {
    this.sendKeysSlow(element(by.css('#actionInput')).clear(), action);
    element(by.css('#actionExec'))
      .click();
    }
  
  setTextOn(id: string, text: string) {
    this.sendKeysSlow(element(by.css(`#${id}`)).clear(), text);
  }
  
  clickButton(id: string) {
    element(by.css(`#${id}`))
      .click();
  }
  
  get result(): Promise<string> {
    return element(by.css('#result')).getText() as any as Promise<string>;
  }

  get updates(): Promise<string> {
    browser.wait(protractor.ExpectedConditions.presenceOf(element(by.id('updateAlert'))));
    return element(by.id('updates')).getText() as any as Promise<string>;
  }

  get asyncResult(): Promise<string> {
    browser.wait(protractor.ExpectedConditions.presenceOf(element(by.id('alert'))));
    return this.result;
  }

  request(url: string): Promise<string> {
    this.reset();
    this.selectAction('MAKE_REQUEST');
    this.setTextOn('requestUrl', url);
    this.clickButton('requestAction');
    return this.asyncResult;
  }
  
  installServiceWorker(url: string): void {
    this.selectAction('SW_INSTALL');
    this.setTextOn('workerUrl', url);
    this.clickButton('installAction');
  }

  forceUpdate(version: string): Promise<string> {
    this.selectAction('FORCE_UPDATE');
    this.setTextOn('updateVersion', version);
    this.clickButton('updateAction');
    return this.result;
  }
  
  hasActiveWorker(): Promise<boolean> {
    this.selectAction('SW_CHECK');
    return this
      .result
      .then(JSON.parse)
      .then(res => res.some(worker => worker.active));
  }
  
  hasServiceWorker(): Promise<boolean> {
    this.selectAction('SW_CHECK');
    browser.waitForAngular();
    return this
      .result
      .then(value => {
        return value;
      })
      .then(value => value !== '[]');
  }

  cacheKeys(): Promise<string[]> {
    this.selectAction('CACHE_KEYS');
    return this
      .result
      .then(JSON.parse);
  }

  ping(): Promise<string> {
    this.reset();
    this.selectAction('COMPANION_PING');
    return this.asyncResult;
  }

  waitForPush(): Promise<string> {
    this.reset();
    this.selectAction('COMPANION_WAIT_FOR_PUSH');
    return this.result;
  }

  log(): Promise<string[]> {
    return (element(by.css('#log'))
      .getText() as any as Promise<string>)
      .then(v => JSON.parse(v))
      .then(log => {
        this.selectAction('RESET');
        return log;
      });
  }

  reset() {
    this.selectAction('RESET');
    browser.wait(protractor.ExpectedConditions.not(
        protractor.ExpectedConditions.presenceOf(element(by.id('alert')))));
    browser.wait(protractor.ExpectedConditions.not(
        protractor.ExpectedConditions.presenceOf(element(by.id('updateAlert')))));
  }

  registerForPush(): Promise<string> {
    this.reset();
    this.selectAction('COMPANION_REG_PUSH');
    return this.asyncResult;
  }

  checkForUpdate(): Promise<boolean> {
    this.reset();
    this.selectAction('CHECK_FOR_UPDATES');
    return this
      .asyncResult
      .then(JSON.parse);
  }

  subscribeToUpdates(): void {
    this.reset();
    this.selectAction('COMPANION_SUBSCRIBE_TO_UPDATES');
  }
}
