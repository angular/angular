/**
 * Plugin System Tokens
 *
 * Chapter 1 (DI) - InjectionToken과 Multi-provider 패턴
 * 확장 가능한 플러그인 아키텍처 구현
 */

import { InjectionToken } from '@angular/core';

/**
 * 플러그인 인터페이스
 */
export interface Plugin {
  name: string;
  version: string;
  initialize(): void;
  destroy?(): void;
}

/**
 * Export 플러그인 인터페이스
 */
export interface ExportPlugin extends Plugin {
  export(data: any): Promise<void> | void;
  getSupportedFormats(): string[];
}

/**
 * Integration 플러그인 인터페이스
 */
export interface IntegrationPlugin extends Plugin {
  connect(): Promise<boolean>;
  disconnect(): void;
  sync(data: any): Promise<void>;
}

/**
 * Multi-provider를 위한 InjectionToken
 *
 * Chapter 1: Multi-provider 패턴으로 여러 플러그인을 동적으로 등록
 */
export const EXPORT_PLUGIN = new InjectionToken<ExportPlugin>('EXPORT_PLUGIN', {
  providedIn: null // 명시적으로 제공되어야 함
});

export const INTEGRATION_PLUGIN = new InjectionToken<IntegrationPlugin>(
  'INTEGRATION_PLUGIN',
  {
    providedIn: null
  }
);

/**
 * 플러그인 설정
 */
export interface PluginConfig {
  enabled: boolean;
  autoInit?: boolean;
  config?: Record<string, any>;
}

export const PLUGIN_CONFIG = new InjectionToken<PluginConfig>('PLUGIN_CONFIG');
