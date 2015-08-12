import {TemplateCmd, BeginBasicElementCmd, createEndBasicElementCmd, BeginComponentCmd,
	createEndComponentCmd, EmbeddedTemplateCmd, NgContentCmd, TextCmd} from './template_commands';

// beginUnboundElement
export function be(name: string, attrs: string[], events:string[], variables:string[], directives:any[], ngContentId: string):TemplateCmd {
	return new BeginBasicElementCmd(name, attrs, events, variables, directives, false, ngContentId);
}
// beginBoundElement
export function bbe(name: string, attrs: string[], events:string[], variables:string[], directives:any[], ngContentId: string):TemplateCmd {
	return new BeginBasicElementCmd(name, attrs, events, variables, directives, true, ngContentId);
}
// endElement
export function ee() {
	return createEndBasicElementCmd();						
}
// beginComponent
export function bc(templateId:string, name: string, attrs: string[], events:string[], variables:string[], directives:any[], nativeShadowDom: boolean, ngContentId: string) {
	return new BeginComponentCmd(templateId, name, attrs, events, variables, directives, nativeShadowDom, ngContentId);		
}
// endComponent
export function ec() {
	return createEndComponentCmd();						
}
// embeddedTemplate
export function et(templateId: string, variables: string[], directive: any, transitiveNgContentCount: number, embeddedTemplate: TemplateCmd[], ngContentId: string) {
	return new EmbeddedTemplateCmd(templateId, variables, directive, transitiveNgContentCount, embeddedTemplate, ngContentId);
}
// ngcontent
export function ct(id: string) {
	return new NgContentCmd(id);
}
// text
export function tt(value:string, ngContentId: string) {
	return new TextCmd(value, false, ngContentId);								
}

export function btt(ngContentId: string) {
	return new TextCmd('', true, ngContentId);								
}