import {getConfig, NgDevConfig} from '../utils/config';


export interface ReleaseConfig {
  changelog: {
    changelogPath: string;
    context?: {[key: string]: any};
    gitCommitOptions?: {[key: string]: any};
    parserOptions?: {[key: string]: any};
    writerOptions?: {[key: string]: any};
  };
}

interface Releases {
  [key: string]: () => ReleaseConfig;
}

export function getReleaseConfig() {
  const config: Partial<NgDevConfig<{release: Releases}>> = getConfig();

  return config as Required<typeof config>;
}
