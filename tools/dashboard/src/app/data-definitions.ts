/** Interface that describes the payload results from the Firebase database. */
export interface PayloadResult {
  timestamp: number;
  // Material bundles
  material_umd: string;
  material_umd_minified_uglify: string;
  material_fesm_2015: string;
  material_fesm_2014: string;
  // CDK bundles
  cdk_umd: string;
  cdk_umd_minified_uglify: string;
  cdk_fesm_2015: string;
  cdk_fesm_2014: string;
}
