import {DOM} from 'angular2/src/facade/dom';
import {Inject} from 'angular2/src/di/annotations';

export class TitleService {
  _appDocument;
  constructor(@Inject('AppDocument') appDocument) {
    this._appDocument = appDocument;
  }

  setTitle(newTitle:string) {
    DOM.setTitle(this._appDocument, newTitle);
  }
}
