import {Promise} from 'angular2/src/facade/async';

// TODO: vsavkin rename it into TemplateLoader and do not reexport it via DomAdapter
export class XHR {
  get(url: string): Promise<string> { return null; }
}
