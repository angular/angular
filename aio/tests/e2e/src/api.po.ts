import { element, by } from 'protractor';
import { SitePage } from './app.po';

export class ApiPage extends SitePage {
  getDescendants(docType: string, onlyDirect = false) {
    // This selector is horrible because we have potentially recursive HTML lists
    //
    // ul
    //   li
    //     code
    //     ul
    //       li
    //         code
    //     ul
    //       li
    //         code
    //   li
    //     code
    //
    // and we want to be able to pull out the code elements from only the first level
    // if `onlyDirect` is set to `true`.
    const selector = `.descendants.${docType} ${onlyDirect ? '>' : ''} ul > li > code`;
    return element.all(by.css(selector)).map<string>(item => item?.getText());
  }

  getOverview(docType: string) {
    return element(by.css(`.${docType}-overview`));
  }

  getSection(cls: string) {
    return element(by.css(`section.${cls}`));
  }

  getBadge(cls: string) {
    return element(by.css('.api-status-label.' +  cls));
  }

  getInstanceMethodOverloads(name: string) {
    return element.all(by.css('.instance-method'))
        .filter(async e => (await e.element(by.css('h3')).getText()).includes(name))
        .all(by.css('.overload-info'));
  }
}
