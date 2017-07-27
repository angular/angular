/** Interface that describes the payload results from the Firebase database. */
export interface PayloadResult {
  timestamp: number;
  // Material bundles
  material_umd: number;
  material_umd_minified_uglify: number;
  material_fesm_2015: number;
  material_fesm_2014: number;
  // CDK bundles
  cdk_umd: number;
  cdk_umd_minified_uglify: number;
  cdk_fesm_2015: number;
  cdk_fesm_2014: number;
}

/** Type that specifies the available coverage entries. */
export type CoverageEntries = 'branches' | 'functions' | 'lines' | 'statements';

/** Interface that describes the coverage reports in Firebase. */
export interface CoverageResult {
  branches: CoverageDataEntry;
  functions: CoverageDataEntry;
  lines: CoverageDataEntry;
  statements: CoverageDataEntry;
  timestamp: number;
}

/** Interface that describes data entries for different coverage types. */
export interface CoverageDataEntry {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}
