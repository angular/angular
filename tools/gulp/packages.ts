import {BuildPackage} from '../package-tools';

export const cdkPackage = new BuildPackage('cdk');
export const materialPackage = new BuildPackage('material', [cdkPackage]);
export const youTubePlayerPackage = new BuildPackage('youtube-player');
export const googleMapsPackage = new BuildPackage('google-maps');
export const cdkExperimentalPackage = new BuildPackage('cdk-experimental', [cdkPackage]);
export const materialExperimentalPackage = new BuildPackage('material-experimental',
    [cdkPackage, cdkExperimentalPackage, materialPackage]);
export const momentAdapterPackage = new BuildPackage('material-moment-adapter', [materialPackage]);

/** List of all build packages defined for this project. */
export const allBuildPackages = [
  cdkPackage,
  materialPackage,
  youTubePlayerPackage,
  cdkExperimentalPackage,
  materialExperimentalPackage,
  momentAdapterPackage,
  googleMapsPackage,
];
