import { ElementPosition } from 'protocol';
import { ApplicationOperations } from 'ng-devtools';

export class ChromeApplicationOperations extends ApplicationOperations {
  viewSource(position: ElementPosition): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.findConstructorByPosition('${position}'))`);
    }
  }

  selectDomElement(position: number[]): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.findDomElementByPosition('${position}'))`);
    }
  }
}
