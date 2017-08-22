// #docregion import-locale-extra
import { registerLocaleData } from '@angular/common';
import localeEnGB from '@angular/common/i18n_data/locale_en-GB';
import localeEnGBExtra from '@angular/common/i18n_data/extra/locale_en-GB';

registerLocaleData(localeEnGB, localeEnGBExtra);
// #enddocregion import-locale-extra
