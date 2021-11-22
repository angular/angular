export interface Process {
  env: Env;
}

interface Env {
  LATEST_SHA: string;
}

export interface Environment {
  production: boolean;
  process: Process;
}

export abstract class ApplicationEnvironment {
  abstract get environment(): Environment;
}
