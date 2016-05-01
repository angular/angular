export enum SecurityContext {
  NONE,
  HTML,
  STYLE,
  SCRIPT,
  URL,
  RESOURCE_URL,
}

export abstract class SanitizationService {
  abstract sanitize(context: SecurityContext, value: any): any;
}
