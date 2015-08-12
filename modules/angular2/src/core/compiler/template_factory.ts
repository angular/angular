import {TemplateCmd, BeginBasicElementCmd, createEndBasicElementCmd, BeginComponentCmd,
	createEndComponentCmd, EmbeddedTemplateCmd, NgContentCmd, TextCmd} from './template_commands';
import {CONST_EXPR, isPresent} from 'angular2/src/facade/lang';

const EMPTY_LIST = CONST_EXPR([]);

function normalizeList(list:string[]):string[] {
	return isPresent(list) ? list : EMPTY_LIST;
}

// beginUnboundElement
export function be(name: string, attrs: string[], events:string[], variables:string[], directives:any[], ngContentIndex: number):TemplateCmd {
	return new BeginBasicElementCmd(name, normalizeList(attrs), normalizeList(events), normalizeList(variables), normalizeList(directives), false, ngContentIndex);
}
// beginBoundElement
export function bbe(name: string, attrs: string[], events:string[], variables:string[], directives:any[], ngContentIndex: number):TemplateCmd {
	return new BeginBasicElementCmd(name, normalizeList(attrs), normalizeList(events), normalizeList(variables), normalizeList(directives), true, ngContentIndex);
}
// endElement
export function ee() {
	return createEndBasicElementCmd();						
}
// beginComponent
export function bc(templateId:string, name: string, attrs: string[], events:string[], variables:string[], directives:any[], nativeShadowDom: boolean, ngContentIndex: number) {
	return new BeginComponentCmd(templateId, name, normalizeList(attrs), normalizeList(events), normalizeList(variables), normalizeList(directives), nativeShadowDom, ngContentIndex);		
}
// endComponent
export function ec() {
	return createEndComponentCmd();						
}
// embeddedTemplate
export function et(templateId: string, attrs:string[], variables: string[], directive: any, isMerged: boolean, ngContentIndex: number, embeddedTemplate: TemplateCmd[]) {
	return new EmbeddedTemplateCmd(templateId, normalizeList(attrs), normalizeList(variables), directive, isMerged, embeddedTemplate, ngContentIndex);
}
// ngcontent
export function ct(index: number, ngContentIndex:number) {
	return new NgContentCmd(index, ngContentIndex);
}
// text
export function tt(value:string, ngContentIndex: number) {
	return new TextCmd(value, false, ngContentIndex);								
}

export function btt(ngContentIndex: number) {
	return new TextCmd('', true, ngContentIndex);								
}