// #docregion import-locale-extra
import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';
import localeFrCaExtra from '@angular/common/locales/extra/fr-CA';

registerLocaleData(localeFrCa, localeFrCaExtra);
// #enddocregion import-locale-extra
