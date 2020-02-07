import { ElementID } from 'protocol';
import { ApplicationOperations } from 'ng-devtools';

export class ChromeApplicationOperations extends ApplicationOperations {
  viewSource(id: ElementID): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.findConstructorByPathId('${id}'))`);
    }
  }
}
