import * as ts from 'typescript';
import {ModuleResolutionHostAdapter} from './compiler_host';


export class IgnoreExternalStylesContext extends ModuleResolutionHostAdapter {
  constructor(host: ts.ModuleResolutionHost) {
    super(host);

    if (host.fileExists) {
      this.fileExists = (path: string) => host.fileExists !(path);
    }
  }


  public fileExists(path: string): boolean { return false; }


  public readResource(path: string): Promise<string> {
    if (!this.fileExists(path)) {
      console.warn('Non-existant file omitted for extraction: %s', path);
    }

    return Promise.resolve(this.fileExists(path) ? this.readFile(path) : '');
  }
}