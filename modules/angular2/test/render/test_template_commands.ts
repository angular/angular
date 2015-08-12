import {CONST_EXPR} from 'angular2/src/facade/lang';
import {RenderTemplateCmd, RenderTemplateCmdType, RenderBeginElementCmd, RenderBeginComponentCmd, RenderTextCmd} from 'angular2/render';

class BeginElementCmd implements RenderBeginElementCmd {
	constructor(public type: RenderTemplateCmdType, public name: string, public attrs: string[], public events: string[], public isBound: boolean, public ngContentId: string) {}
}

class BeginComponentCmd implements RenderBeginComponentCmd {
	constructor(public type: RenderTemplateCmdType, public name: string, public attrs: string[], public events: string[], public nativeShadow:boolean, public ngContentId: string) {}
	get isBound() { return true; }	
}

class EndElementCmd implements RenderTemplateCmd {
	constructor(public type: RenderTemplateCmdType) {}
}

class TextCmd implements RenderTextCmd {
	constructor(public value: string, public isBound: boolean, public ngContentId: string) {}
	get type() { return RenderTemplateCmdType.TEXT; }
}

const EMPTY_LIST = CONST_EXPR([]);

export function be(name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, ngContentId = null):RenderTemplateCmd {
	return new BeginElementCmd(RenderTemplateCmdType.BEGIN_BASIC_ELEMENT, name, attrs, events, false, ngContentId);
}

export function bbe(name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, ngContentId = null):RenderTemplateCmd {
	return new BeginElementCmd(RenderTemplateCmdType.BEGIN_BASIC_ELEMENT, name, attrs, events, true, ngContentId);
}

export function ee():RenderTemplateCmd {
  return new EndElementCmd(RenderTemplateCmdType.END_BASIC_ELEMENT);
}

export function bc(name: string, attrs: string[] = EMPTY_LIST, events: string[] = EMPTY_LIST, nativeShadow:boolean = false, ngContentId = null):RenderTemplateCmd {
	return new BeginComponentCmd(RenderTemplateCmdType.BEGIN_COMPONENT, name, attrs, events, nativeShadow, ngContentId);
}

export function ec():RenderTemplateCmd {
  return new EndElementCmd(RenderTemplateCmdType.END_COMPONENT);
}

export function tpl(ngContentId = null):RenderTemplateCmd {
	return new BeginElementCmd(RenderTemplateCmdType.TEMPLATE_ANCHOR, 'template', [], [], true, ngContentId);
}

export function tt(value: string, isBound: boolean = false, ngContentId = null):RenderTemplateCmd {
	return new TextCmd(value, isBound, ngContentId);
}
