import {Type} from 'angular2/src/facade/lang';
import {TemplateCmd} from './template_commands';
import {Injectable} from 'angular2/di';

@Injectable()
export class TemplateRegistry {
  constructor(private _templateCmds: Map<string, TemplateCmd[]>, private _sharedStyles: Map<string, string[]>) {}
  getTemplate(templateId:string):TemplateCmd[] { return this._templateCmds.get(templateId); }
  getSharedStyles(templateId:string):string[] { return this._sharedStyles.get(templateId); }
}

