import { InjectionToken } from '@angular/core';

export interface Plugin {
  name: string;
  execute(data: any): string;
}

export const PLUGIN_TOKEN = new InjectionToken<Plugin[]>('PLUGIN_TOKEN', {
  providedIn: 'root',
  factory: () => []
});

export interface PluginConfig {
  enableLogging: boolean;
  maxPlugins: number;
}

export const PLUGIN_CONFIG = new InjectionToken<PluginConfig>('PLUGIN_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    enableLogging: true,
    maxPlugins: 10
  })
});
