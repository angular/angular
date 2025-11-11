import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { PLUGIN_TOKEN, PLUGIN_CONFIG } from './app/plugin-system/plugin.token';
import { CsvExportPlugin } from './app/plugin-system/plugins/csv-export.plugin';
import { PdfExportPlugin } from './app/plugin-system/plugins/pdf-export.plugin';
import { JsonExportPlugin } from './app/plugin-system/plugins/json-export.plugin';

bootstrapApplication(AppComponent, {
  providers: [
    // Multi-provider 패턴: 여러 플러그인을 동일한 토큰에 등록
    { provide: PLUGIN_TOKEN, useClass: CsvExportPlugin, multi: true },
    { provide: PLUGIN_TOKEN, useClass: PdfExportPlugin, multi: true },
    { provide: PLUGIN_TOKEN, useClass: JsonExportPlugin, multi: true },

    // 설정 오버라이드
    {
      provide: PLUGIN_CONFIG,
      useValue: {
        enableLogging: true,
        maxPlugins: 10
      }
    }
  ]
}).catch(err => console.error(err));
