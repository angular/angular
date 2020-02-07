import { ElementID } from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(id: ElementID): void;
}
