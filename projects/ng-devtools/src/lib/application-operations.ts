import { ElementPosition } from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(position: ElementPosition): void;
  abstract selectDomElement(position: ElementPosition): void;
}
