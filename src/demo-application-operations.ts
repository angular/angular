import { ApplicationOperations } from 'ng-devtools';

export class DemoApplicationOperations extends ApplicationOperations {
  viewSource(id: number[]): void {
    console.warn('viewSource() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
  selectDomElement(id: number[]): void {
    console.warn('selectDomElement() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
}
