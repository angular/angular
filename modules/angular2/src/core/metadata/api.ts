import {isPresent, CONST, CONST_EXPR, Type} from 'angular2/src/facade/lang';


@CONST()
export class PublicApiMetadata {

  /**
   * Specifies the api stability level. See {@link ApiStability} for available levels.
   */
  stability: ApiStability;

  /**
   * Optional note that contains additional information about the api (e.g. migration instructions
   * for deprecated APIs).
   *
   * The content of the note should be in markdown format and can contain dgeni labels like
   * `{@link}`.
   */
  note: string;


  constructor({stability, note}: {stability: ApiStability, note?: string}) {
    this.stability = stability;
    this.note = note;
  }
}


export enum ApiStability {
  /**
   * The API should not be used by new code. See `note` for migration information.
   */
  Deprecated,
  /**
   * The API is available for experimentation. Either changes are still planned or more more
   * feedback is needed to promote the api to the next level. See `note` for more details.
   */
  Experimental,
  /**
   * The API is considered to be stable, but we reserve the right to change if a serious reason
   * is discovered during the beta period.
   */
  Beta,
  /**
   * The API is stable. Backwards compatibility is priority. New features should take into account
   * the current usage patterns. Breaking changes should be considered only if absolutely necessary.
   */
  Stable,
  /**
   * The API is locked and no new functionality will be considered. Only fixes related to
   * performance and security will be accepted.
   */
  Locked
}
