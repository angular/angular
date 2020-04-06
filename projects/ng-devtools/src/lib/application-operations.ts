import { DirectivePosition, ElementPosition } from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(position: ElementPosition): void;
  abstract selectDomElement(position: ElementPosition): void;
  abstract inspectFunction(position: DirectivePosition, keyPath: string[]): void;
}
