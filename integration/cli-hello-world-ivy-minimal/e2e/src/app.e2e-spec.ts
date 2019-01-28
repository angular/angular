import { browser } from 'protractor';
import { AppPage } from './app.po';

describe('cli-hello-world-ivy-minimal App', () => {
  // Ivy renderComponent apps fail on protractor when waiting for Angular.
  browser.waitForAngularEnabled(false);

  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to cli-hello-world-ivy-minimal!');
  });
});
