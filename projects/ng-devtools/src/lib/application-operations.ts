import { ElementID } from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(id: ElementID): void;
  abstract selectDomElement(id: ElementID): void;
}
