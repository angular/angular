// #docregion import-locale-extra
import { registerLocaleData } from '@angular/common';
import localeEnGB from '@angular/common/locales/en-GB';
import localeEnGBExtra from '@angular/common/locales/extra/en-GB';

registerLocaleData(localeEnGB, localeEnGBExtra);
// #enddocregion import-locale-extra
