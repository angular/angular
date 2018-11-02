import {getEnvVar} from './utils';

export const AIO_ARTIFACT_PATH = getEnvVar('AIO_ARTIFACT_PATH');
export const AIO_BUILDS_DIR = getEnvVar('AIO_BUILDS_DIR');
export const AIO_GITHUB_TOKEN = getEnvVar('AIO_GITHUB_TOKEN');
export const AIO_CIRCLE_CI_TOKEN = getEnvVar('AIO_CIRCLE_CI_TOKEN');
export const AIO_DOMAIN_NAME = getEnvVar('AIO_DOMAIN_NAME');
export const AIO_GITHUB_ORGANIZATION = getEnvVar('AIO_GITHUB_ORGANIZATION');
export const AIO_GITHUB_REPO = getEnvVar('AIO_GITHUB_REPO');
export const AIO_GITHUB_TEAM_SLUGS = getEnvVar('AIO_GITHUB_TEAM_SLUGS');
export const AIO_NGINX_HOSTNAME = getEnvVar('AIO_NGINX_HOSTNAME');
export const AIO_NGINX_PORT_HTTP = +getEnvVar('AIO_NGINX_PORT_HTTP');
export const AIO_NGINX_PORT_HTTPS = +getEnvVar('AIO_NGINX_PORT_HTTPS');
export const AIO_SIGNIFICANT_FILES_PATTERN = getEnvVar('AIO_SIGNIFICANT_FILES_PATTERN');
export const AIO_TRUSTED_PR_LABEL = getEnvVar('AIO_TRUSTED_PR_LABEL');
export const AIO_PREVIEW_SERVER_HOSTNAME = getEnvVar('AIO_PREVIEW_SERVER_HOSTNAME');
export const AIO_PREVIEW_SERVER_PORT = +getEnvVar('AIO_PREVIEW_SERVER_PORT');
export const AIO_ARTIFACT_MAX_SIZE = +getEnvVar('AIO_ARTIFACT_MAX_SIZE');
export const AIO_WWW_USER = getEnvVar('AIO_WWW_USER');
