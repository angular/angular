interface Env {
  LATEST_SHA: string;
}

export interface Environment {
  production: boolean;
  LATEST_SHA: string;
}

export abstract class ApplicationEnvironment {
  abstract get environment(): Environment;
}
