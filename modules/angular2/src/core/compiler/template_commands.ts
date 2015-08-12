import {Type} from 'angular2/src/facade/lang';
import {RenderTemplateCmdType, RenderTemplateCmd,
	RenderBeginElementCmd, RenderTextCmd, RenderNgContentCmd, RenderBeginComponentCmd} from 'angular2/render';

export {RenderTemplateCmdType} from 'angular2/render';

var EMPTY_STRING_ARR = [];

export interface TemplateCmd extends RenderTemplateCmd {
	type: RenderTemplateCmdType;
}

export function isVoidElement(type:RenderTemplateCmdType) {
	return type === RenderTemplateCmdType.TEMPLATE_ANCHOR || type === RenderTemplateCmdType.NG_CONTENT;	
}

export function isBeginElement(type:RenderTemplateCmdType) {
	return isVoidElement(type) || type === RenderTemplateCmdType.BEGIN_BASIC_ELEMENT || type === RenderTemplateCmdType.BEGIN_BASIC_ELEMENT;
} 

export function isEndElement(type:RenderTemplateCmdType) {
	return isVoidElement(type) || type === RenderTemplateCmdType.END_BASIC_ELEMENT || type === RenderTemplateCmdType.END_COMPONENT;
} 

export function isText(type:RenderTemplateCmdType) {
	return type === RenderTemplateCmdType.TEXT;
}

// TODO(tbosch): ts2dart does not support multiple base interfaces
export interface BeginElementCmd extends /*TemplateCmd, */RenderBeginElementCmd {
	variables: string[];
	directives: any[];
	isBound: boolean;
}

class EndElementCmd implements TemplateCmd {
	constructor(public type: RenderTemplateCmdType) {}
}

export class EmbeddedTemplateCmd implements BeginElementCmd {
	constructor(public templateId: string, public variables: string[], public directives: any[], public transitiveNgContentCount: number, public content:TemplateCmd[], public ngContentId:string) {}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.TEMPLATE_ANCHOR; }
	get name() { return 'template'; }
	get attrs() { return EMPTY_STRING_ARR; }
	get events() { return EMPTY_STRING_ARR; }
	get isBound() { return true; }
}

export class BeginBasicElementCmd implements BeginElementCmd {
	constructor(public name: string, public attrs: string[], public events: string[], public variables:string[], public directives: any[], public isBound: boolean, public ngContentId:string) {
	}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.BEGIN_BASIC_ELEMENT; }
}

export function createEndBasicElementCmd():TemplateCmd {
	return new EndElementCmd(RenderTemplateCmdType.END_BASIC_ELEMENT);
}

export class BeginComponentCmd implements BeginElementCmd, RenderBeginComponentCmd {
	component: any;
	constructor(public templateId: string, public name: string, public attrs: string[], public events: string[], public variables:string[], public directives: any[], public nativeShadow:boolean, public ngContentId:string) {
		this.component = directives[0];
	}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.BEGIN_COMPONENT; }
	get isBound() { return true; }
}

export function createEndComponentCmd():TemplateCmd {
	return new EndElementCmd(RenderTemplateCmdType.END_COMPONENT);
}

export class NgContentCmd implements RenderNgContentCmd {
	constructor(public id:string) {}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.NG_CONTENT; }
}

export class TextCmd implements RenderTextCmd {
	constructor(public value:string, public isBound:boolean, public ngContentId: string) {}
	get type(): RenderTemplateCmdType { return RenderTemplateCmdType.TEXT; }
}
