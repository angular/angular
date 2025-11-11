// Zone.js는 변경 감지를 위해 비동기 작업을 가로채기 위해 필요합니다
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';

// 애플리케이션 부트스트랩
bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
