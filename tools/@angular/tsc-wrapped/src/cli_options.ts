/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export class CliOptions {
  public basePath: string;
  constructor({basePath = null}: {basePath?: string}) { this.basePath = basePath; }
}

export class I18nExtractionCliOptions extends CliOptions {
  public i18nFormat: string;
  public i18nSerializer: string;

  constructor({i18nFormat = null,
               i18nSerializer = null}: {i18nFormat?: string, i18nSerializer?: string}) {
    super({});
    this.i18nFormat = i18nFormat;
    this.i18nSerializer = i18nSerializer;
  }
}

export class NgcCliOptions extends CliOptions {
  public i18nFormat: string;
  public i18nSerializer: string;
  public i18nFile: string;
  public locale: string;

  constructor({i18nFormat = null, i18nSerializer = null, i18nFile = null, locale = null,
               basePath = null}: {
    i18nFormat?: string,
    i18nSerializer?: string,
    i18nFile?: string,
    locale?: string,
    basePath?: string
  }) {
    super({basePath: basePath});
    this.i18nFormat = i18nFormat;
    this.i18nSerializer = i18nSerializer;
    this.i18nFile = i18nFile;
    this.locale = locale;
  }
}
