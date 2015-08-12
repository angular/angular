import {CONST_EXPR} from 'angular2/src/facade/lang';
import {RenderTemplateCmd, RenderTemplateCmdType, RenderBeginElementCmd, RenderBeginComponentCmd, RenderTextCmd, RenderEmbeddedTemplateCmd} from 'angular2/render';

class BeginElementCmd implements RenderBeginElementCmd {
	constructor(public name: string, public attrs: string[], public events: string[], public isBound: boolean, public ngContentIndex: number) {}
	get type() { return RenderTemplateCmdType.BEGIN_BASIC_ELEMENT; }	
}

class BeginComponentCmd implements RenderBeginComponentCmd {
	constructor(public templateId:string, public name: string, public attrs: string[], public events: string[], public nativeShadow:boolean, public ngContentIndex: number) {}
	get isBound() { return true; }
	get type() { return RenderTemplateCmdType.BEGIN_COMPONENT; }	
}

class EndElementCmd implements RenderTemplateCmd {
	constructor(public type: RenderTemplateCmdType) {}
}

class TextCmd implements RenderTextCmd {
	constructor(public value: string, public isBound: boolean, public ngContentIndex: number) {}
	get type() { return RenderTemplateCmdType.TEXT; }
}

class EmbeddedTemplateCmd implements RenderEmbeddedTemplateCmd {
	constructor(public templateId:string, public isMerged:boolean, public ngContentIndex:number, public content: RenderTemplateCmd[]) {}
	get type() { return RenderTemplateCmdType.EMBEDDED_TEMPLATE; }	
	get name() { return 'template'; }
	get attrs() { return []; }
	get isBound() { return true; }
}

const EMPTY_LIST = CONST_EXPR([]);

export function be(name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, ngContentIndex:number = null):RenderTemplateCmd {
	return new BeginElementCmd(name, attrs, events, false, ngContentIndex);
}

export function bbe(name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, ngContentIndex:number = null):RenderTemplateCmd {
	return new BeginElementCmd(name, attrs, events, true, ngContentIndex);
}

export function ee():RenderTemplateCmd {
  return new EndElementCmd(RenderTemplateCmdType.END_BASIC_ELEMENT);
}

export function bc(templateId:string, name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, nativeShadow:boolean = false, ngContentIndex:number = null):RenderTemplateCmd {
	return new BeginComponentCmd(templateId, name, attrs, events, nativeShadow, ngContentIndex);
}

export function ec():RenderTemplateCmd {
  return new EndElementCmd(RenderTemplateCmdType.END_COMPONENT);
}

export function tpl(templateId:string, isMerged:boolean, ngContentIndex:number, content: RenderTemplateCmd[]):RenderTemplateCmd {
	return new EmbeddedTemplateCmd(templateId, isMerged, ngContentIndex, content);
}

export function tt(value: string, isBound: boolean = false, ngContentIndex:number = null):RenderTemplateCmd {
	return new TextCmd(value, isBound, ngContentIndex);
}
