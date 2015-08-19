import {Type} from 'angular2/src/facade/lang';
import {RenderTemplateCmdType, RenderTemplateCmd,
	RenderBeginElementCmd, RenderTextCmd, RenderNgContentCmd, RenderBeginComponentCmd, RenderEmbeddedTemplateCmd, RenderCommonBeginElementCmd} from 'angular2/render';

export {RenderTemplateCmdType} from 'angular2/render';

var EMPTY_STRING_ARR = [];

export interface TemplateCmd extends RenderTemplateCmd {
	type: RenderTemplateCmdType;
}

export function isVoidElement(type:RenderTemplateCmdType) {
	return type === RenderTemplateCmdType.EMBEDDED_TEMPLATE || type === RenderTemplateCmdType.NG_CONTENT;	
}

export function isBeginElement(type:RenderTemplateCmdType) {
	return isVoidElement(type) || type === RenderTemplateCmdType.BEGIN_BASIC_ELEMENT || type === RenderTemplateCmdType.BEGIN_COMPONENT;
} 

export function isEndElement(type:RenderTemplateCmdType) {
	return isVoidElement(type) || type === RenderTemplateCmdType.END_BASIC_ELEMENT || type === RenderTemplateCmdType.END_COMPONENT;
} 

export function isText(type:RenderTemplateCmdType) {
	return type === RenderTemplateCmdType.TEXT;
}

// TODO(tbosch): ts2dart does not support multiple base interfaces
export interface CommonBeginElementCmd extends /*TemplateCmd, */RenderCommonBeginElementCmd {
	variables: string[];
	directives: any[];
}

class EndElementCmd implements TemplateCmd {
	constructor(public type: RenderTemplateCmdType) {}
}

export class EmbeddedTemplateCmd implements TemplateCmd, CommonBeginElementCmd, RenderEmbeddedTemplateCmd {
	constructor(public templateId: string, public attrs: string[], public variables: string[], public directive: any, public isMerged: boolean, public content:TemplateCmd[], public ngContentIndex:number) {}
	get directives() { return [this.directive]; }
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.EMBEDDED_TEMPLATE; }
	get isBound() { return true; }
}

export class BeginBasicElementCmd implements TemplateCmd, CommonBeginElementCmd, RenderBeginElementCmd {
	constructor(public name: string, public attrs: string[], public events: string[], public variables:string[], public directives: any[], public isBound: boolean, public ngContentIndex:number) {
	}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.BEGIN_BASIC_ELEMENT; }
}

export function createEndBasicElementCmd():TemplateCmd {
	return new EndElementCmd(RenderTemplateCmdType.END_BASIC_ELEMENT);
}

export class BeginComponentCmd implements TemplateCmd, CommonBeginElementCmd, RenderBeginComponentCmd {
	component: any;
	constructor(public templateId: string, public name: string, public attrs: string[], public events: string[], public variables:string[], public directives: any[], public nativeShadow:boolean, public ngContentIndex:number) {
		this.component = directives[0];
	}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.BEGIN_COMPONENT; }
	get isBound() { return true; }
}

export function createEndComponentCmd():TemplateCmd {
	return new EndElementCmd(RenderTemplateCmdType.END_COMPONENT);
}

export class NgContentCmd implements RenderNgContentCmd {
	constructor(public index:number, public ngContentIndex:number) {}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.NG_CONTENT; }
}

export class TextCmd implements RenderTextCmd {
	constructor(public value:string, public isBound:boolean, public ngContentIndex: number) {}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.TEXT; }
}
