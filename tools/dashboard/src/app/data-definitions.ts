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
