import { Component, InjectionToken, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Value Provider
const API_URL = new InjectionToken<string>('API_URL');

// 2. Class Provider
class LoggerService {
  log(message: string) {
    console.log(`[Logger] ${message}`);
    return `로그: ${message}`;
  }
}

// 3. Factory Provider
const CONFIG_FACTORY = () => ({
  production: false,
  apiUrl: 'https://api.example.com',
  timeout: 5000
});

const CONFIG = new InjectionToken<any>('CONFIG');

// 4. Existing Provider (Alias)
const LEGACY_LOGGER = new InjectionToken<LoggerService>('LEGACY_LOGGER');

@Component({
  selector: 'app-provider-examples',
  standalone: true,
  imports: [CommonModule],
  providers: [
    // Value provider
    { provide: API_URL, useValue: 'https://api.example.com' },

    // Class provider
    { provide: LoggerService, useClass: LoggerService },

    // Factory provider
    { provide: CONFIG, useFactory: CONFIG_FACTORY },

    // Existing provider (alias)
    { provide: LEGACY_LOGGER, useExisting: LoggerService }
  ],
  template: `
    <div class="section">
      <h3>Provider 타입 예제</h3>

      <div class="provider-list">
        <div>
          <h4>1. Value Provider</h4>
          <p>API URL: <code>{{ apiUrl }}</code></p>
        </div>

        <div>
          <h4>2. Class Provider</h4>
          <button (click)="testLogger()">Logger 테스트</button>
          <p *ngIf="logOutput" class="output">{{ logOutput }}</p>
        </div>

        <div>
          <h4>3. Factory Provider</h4>
          <p>설정: <code>{{ config | json }}</code></p>
        </div>

        <div>
          <h4>4. Existing Provider (Alias)</h4>
          <button (click)="testLegacyLogger()">Legacy Logger 테스트</button>
          <p *ngIf="legacyOutput" class="output">{{ legacyOutput }}</p>
        </div>
      </div>
    </div>
  `
})
export class ProviderExamplesComponent {
  apiUrl = inject(API_URL);
  logger = inject(LoggerService);
  config = inject(CONFIG);
  legacyLogger = inject(LEGACY_LOGGER);

  logOutput = '';
  legacyOutput = '';

  testLogger() {
    this.logOutput = this.logger.log('일반 Logger를 통한 로그');
  }

  testLegacyLogger() {
    this.legacyOutput = this.legacyLogger.log('Legacy Logger (alias)를 통한 로그');
  }
}
