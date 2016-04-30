export enum SecurityContext {
  NONE,
  HTML,
  STYLE,
  SCRIPT,
  URL,
  RESOURCE_URL,
}

export interface SafeHtml {}
export interface SafeStyle {}
export interface SafeScript {}
export interface SafeUrl {}
export interface SafeResourceUrl {}

export abstract class SanitizationService {
  abstract sanitizeHtml(value: string): SafeHtml;
  abstract sanitizeStyleValue(value: string): SafeScript;
  abstract sanitizeUrl(value: string): SafeUrl;

  abstract getSafeHtmlValue(value: SafeHtml|string): string;
  abstract getSafeStyleValue(value: SafeStyle|string): string;
  abstract getSafeScript(value: SafeScript|string): string;
  abstract getSafeUrl(value: SafeUrl|string): string;
  abstract getSafeResourceUrl(value: SafeResourceUrl|string): string;

  abstract bypassSecurityTrustAsHtml(value: string): SafeHtml;
  abstract bypassSecurityTrustAsStyle(value: string): SafeStyle;
  abstract bypassSecurityTrustAsScript(value: string): SafeScript;
  abstract bypassSecurityTrustAsUrl(value: string): SafeUrl;
  abstract bypassSecurityTrustAsResourceUrl(value: string): SafeResourceUrl;
}
