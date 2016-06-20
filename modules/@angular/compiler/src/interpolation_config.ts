export interface InterpolationConfig {
  start: string;
  end: string;
}

export const DEFAULT_INTERPOLATION_CONFIG: InterpolationConfig = {
  start: '{{',
  end: '}}'
};
