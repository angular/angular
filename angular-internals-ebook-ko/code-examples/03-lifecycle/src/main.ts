// Angular 부트스트래핑 파일
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

// 애플리케이션 부트스트래핑
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
