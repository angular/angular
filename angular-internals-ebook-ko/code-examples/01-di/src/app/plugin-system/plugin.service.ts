import { Injectable, inject } from '@angular/core';
import { PLUGIN_TOKEN, PLUGIN_CONFIG, Plugin } from './plugin.token';

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private plugins = inject(PLUGIN_TOKEN);
  private config = inject(PLUGIN_CONFIG);

  getPlugins(): Plugin[] {
    return this.plugins;
  }

  executeAll(data: any): string[] {
    const results: string[] = [];

    if (this.config.enableLogging) {
      console.log(`플러그인 ${this.plugins.length}개 실행 중...`);
    }

    for (const plugin of this.plugins) {
      if (results.length >= this.config.maxPlugins) {
        console.warn('최대 플러그인 수에 도달했습니다');
        break;
      }

      const result = plugin.execute(data);
      results.push(`[${plugin.name}] ${result}`);

      if (this.config.enableLogging) {
        console.log(`플러그인 실행됨: ${plugin.name}`);
      }
    }

    return results;
  }

  getPluginCount(): number {
    return this.plugins.length;
  }
}
