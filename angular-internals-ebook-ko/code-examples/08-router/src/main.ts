// Router 예제의 메인 부트스트랩 파일
// Angular 18+ 스탠드얼론 API를 사용하여 애플리케이션을 초기화합니다.

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withDebugTracing, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/**
 * 애플리케이션 부트스트랩
 *
 * provideRouter를 사용하여 라우팅을 설정하고,
 * 다양한 라우팅 기능(디버깅, 프리로딩 등)을 제공합니다.
 */
bootstrapApplication(AppComponent, {
  // 라우팅 제공자 설정
  providers: [
    provideRouter(
      routes,
      // 라우트 변경을 콘솔에 로깅하는 디버그 모드 (개발 중에만 사용)
      withDebugTracing(),
      // 모든 지연 로드 모듈을 미리 로드하여 성능을 최적화
      withPreloading(PreloadAllModules)
    ),
    // 애니메이션 지원
    provideAnimations(),
  ],
}).catch((err) => {
  console.error('애플리케이션 부트스트랩 실패:', err);
});
