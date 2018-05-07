import { AppPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('providers App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  function getUsersStruct() {
    return {
      user: element.all(by.css('ng-component li')).get(0),
      userId: element.all(by.css('ng-component span')).get(0)
    };
  }

  function getListSectionStruct() {
    return {
      items: element.all(by.css('app-root li'))
    };
  }

  it('should display header that says Users list', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Users list');
  });


  it('shows a list of customers', function() {
    const list = getListSectionStruct();
    expect(list.items.count()).toBe(10);
    expect(list.items.get(0).getText()).toBe('1 Maria');
    expect(list.items.get(9).getText()).toBe('10 Seth');
  });

});
