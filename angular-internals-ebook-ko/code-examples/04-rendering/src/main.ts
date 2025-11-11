import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Angular 렌더링 엔진 부트스트랩
// RootComponent는 자동으로 LView 구조를 생성하고 렌더링 엔진이 초기화됩니다
bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
