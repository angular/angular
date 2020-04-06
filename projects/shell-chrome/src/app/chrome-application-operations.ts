import { DirectivePosition, ElementPosition } from 'protocol';
import { ApplicationOperations } from 'ng-devtools';

export class ChromeApplicationOperations extends ApplicationOperations {
  viewSource(position: ElementPosition): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.findConstructorByPosition('${position}'))`);
    }
  }

  selectDomElement(position: ElementPosition): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.findDomElementByPosition('${position}'))`);
    }
  }

  inspectFunction(directivePosition: DirectivePosition, keyPath: string[]): void {
    if (chrome.devtools) {
      const args = {
        directivePosition,
        keyPath,
      };
      chrome.devtools.inspectedWindow.eval(
        `inspect(inspectedApplication.findFunctionByPosition('${JSON.stringify(args)}'))`
      );
    }
  }
}
