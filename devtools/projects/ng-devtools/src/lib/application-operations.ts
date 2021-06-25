import {DirectivePosition, ElementPosition} from 'protocol';

export abstract class ApplicationOperations {
  abstract viewSource(position: ElementPosition): void;
  abstract selectDomElement(position: ElementPosition): void;
  abstract inspect(directivePosition: DirectivePosition, objectPath: string[]): void;
}
