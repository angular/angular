import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Angular 애플리케이션 부트스트랩
// Change Detection 예제 애플리케이션을 시작합니다
bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
