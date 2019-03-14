// #docregion
import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// webpack에 사용할 require 메소드를 선언합니다.
declare const require;
// webpack raw-loader를 사용해서 파일의 내용을 문자열로 읽어옵니다.
const translations = require(`raw-loader!./locale/messages.fr.xlf`);

platformBrowserDynamic().bootstrapModule(AppModule, {
  providers: [
    {provide: TRANSLATIONS, useValue: translations},
    {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'}
  ]
});
