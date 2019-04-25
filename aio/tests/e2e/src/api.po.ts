import { element, by } from 'protractor';
import { SitePage } from './app.po';

export class ApiPage extends SitePage {
  constructor(url: string) {
    super();
    this.navigateTo(url);
  }

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
    return element.all(by.css(selector)).map<string>(item => item && item.getText());
  }

  getOverview(docType) {
    return element(by.css(`.${docType}-overview`));
  }

  getSection(cls) {
    return element(by.css(`section.${cls}`));
  }

  getBadge(cls) {
    return element(by.css('.api-status-label.' +  cls));
  }
}
