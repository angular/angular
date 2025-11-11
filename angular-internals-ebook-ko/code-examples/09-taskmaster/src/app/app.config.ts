/**
 * Application Configuration
 *
 * Chapter 1 (DI) - Provider 설정
 * Chapter 5 (Compiler) - Standalone 애플리케이션 설정
 * Chapter 8 (Router) - Router 설정
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { EXPORT_PLUGIN } from './core/plugins/plugin.token';
import { CsvExportPlugin } from './plugins/export/csv-export.plugin';
import { PdfExportPlugin } from './plugins/export/pdf-export.plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    // Chapter 6: Zone.js 최적화
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Chapter 8: Router 설정
    provideRouter(routes),

    // Chapter 1: Multi-provider 패턴으로 플러그인 등록
    {
      provide: EXPORT_PLUGIN,
      useClass: CsvExportPlugin,
      multi: true
    },
    {
      provide: EXPORT_PLUGIN,
      useClass: PdfExportPlugin,
      multi: true
    }
  ]
};
