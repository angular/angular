import {isPresent, Type, stringify, BaseException} from 'angular2/src/facade/lang';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {Component} from 'angular2/src/core/annotations_impl/annotations';


class BaseUrl {
  // ugly, chrome specific
  static re: RegExp = /(?:\((.*?):\d+:\d+)|(?:at ([^(]+):\d+:\d+)/;

  get here() {
    let stack: string = new Error()['stack'];

    if (isPresent(stack)) {
      let lines = stack.split('\n');

      if (lines.length > 2) {
        let matches = lines[2].match(BaseUrl.re);
        if (isPresent(matches)) {
          console.log(isPresent(matches[1]) ? matches[1] : matches[2]);
          return isPresent(matches[1]) ? matches[1] : matches[2];
        }
      }
    }

    return null;
  }
}

export const baseUrl = new BaseUrl();

export function getComponentBaseUrl(component: Type): string {
  let annotation = new DirectiveResolver().resolve(component);

  if (annotation instanceof Component) {
    return isPresent(annotation.baseUrl) ? annotation.baseUrl : '';
  }

  throw new BaseException(`${stringify(component)} is not a component}`);
}
