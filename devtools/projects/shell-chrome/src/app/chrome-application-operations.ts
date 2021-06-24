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

  inspect(directivePosition: DirectivePosition, objectPath: string[]): void {
    if (chrome.devtools) {
      const args = {
        directivePosition,
        objectPath,
      };
      chrome.devtools.inspectedWindow.eval(
        `inspect(inspectedApplication.findPropertyByPosition('${JSON.stringify(args)}'))`
      );
    }
  }
}
