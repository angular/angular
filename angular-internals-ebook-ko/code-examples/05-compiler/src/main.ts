import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Angular 18+ 스탠드얼론 부트스트랩
// AOT (Ahead-of-Time) 컴파일러로 미리 컴파일됨
bootstrapApplication(AppComponent)
  .catch(err => console.error(err));
