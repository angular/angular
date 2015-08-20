import {isString} from 'angular2/src/core/facade/lang';
import {Injectable, Inject} from 'angular2/di';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE} from './dom_tokens';

@Injectable()
export class TemplateCloner {
  maxInMemoryElementsPerTemplate: number;

  constructor(@Inject(MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE) maxInMemoryElementsPerTemplate) {
    this.maxInMemoryElementsPerTemplate = maxInMemoryElementsPerTemplate;
  }

  prepareForClone(templateRoot: Element): Element | string {
    var elementCount = DOM.querySelectorAll(DOM.content(templateRoot), '*').length;
    if (this.maxInMemoryElementsPerTemplate >= 0 &&
        elementCount >= this.maxInMemoryElementsPerTemplate) {
      return DOM.getInnerHTML(templateRoot);
    } else {
      return templateRoot;
    }
  }

  cloneContent(preparedTemplateRoot: Element | string, importNode: boolean): Node {
    var templateContent;
    if (isString(preparedTemplateRoot)) {
      templateContent = DOM.content(DOM.createTemplate(preparedTemplateRoot));
      if (importNode) {
        // Attention: We can't use document.adoptNode here
        // as this does NOT wake up custom elements in Chrome 43
        // TODO: Use div.innerHTML instead of template.innerHTML when we
        // have code to support the various special cases and
        // don't use importNode additionally (e.g. for <tr>, svg elements, ...)
        // see https://github.com/angular/angular/issues/3364
        templateContent = DOM.importIntoDoc(templateContent);
      }
    } else {
      templateContent = DOM.content(<Element>preparedTemplateRoot);
      if (importNode) {
        templateContent = DOM.importIntoDoc(templateContent);
      } else {
        templateContent = DOM.clone(templateContent);
      }
    }
    return templateContent;
  }
}