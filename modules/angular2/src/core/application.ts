// Public API for Application
export {APP_COMPONENT} from './application_tokens';
export {platform, commonBootstrap as bootstrap} from './application_common';
export {version} from './application_version';
export {
  PlatformRef,
  ApplicationRef,
  applicationCommonBindings,
  createNgZone,
  platformCommon,
  platformBindings
} from './application_ref';
