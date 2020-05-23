# Image metadata and config
FROM debian:buster

LABEL name="angular.io PR preview" \
      description="This image implements the PR preview functionality for angular.io." \
      vendor="Angular" \
      version="1.0"

VOLUME /aio-secrets
VOLUME /var/www/aio-builds
VOLUME /dockerbuild

EXPOSE 80 443


# Build-time args and env vars
# The AIO_ARTIFACT_PATH path needs to be kept in synch with the value of
# `aio_preview->steps->store_artifacts->destination` property in `.circleci/config.yml`
ARG      AIO_ARTIFACT_PATH=aio/dist/aio-snapshot.tgz
ARG TEST_AIO_ARTIFACT_PATH=$AIO_ARTIFACT_PATH
ARG      AIO_BUILDS_DIR=/var/www/aio-builds
ARG TEST_AIO_BUILDS_DIR=/tmp/aio-builds
ARG      AIO_DOMAIN_NAME=ngbuilds.io
ARG TEST_AIO_DOMAIN_NAME=$AIO_DOMAIN_NAME.localhost
ARG      AIO_GITHUB_ORGANIZATION=angular
ARG TEST_AIO_GITHUB_ORGANIZATION=test-org
ARG      AIO_GITHUB_REPO=angular
ARG TEST_AIO_GITHUB_REPO=test-repo
ARG      AIO_GITHUB_TEAM_SLUGS=aio-auto-previews,aio-contributors
ARG TEST_AIO_GITHUB_TEAM_SLUGS=test-team-1,test-team-2
ARG      AIO_NGINX_HOSTNAME=$AIO_DOMAIN_NAME
ARG TEST_AIO_NGINX_HOSTNAME=$TEST_AIO_DOMAIN_NAME
ARG      AIO_NGINX_PORT_HTTP=80
ARG TEST_AIO_NGINX_PORT_HTTP=8080
ARG      AIO_NGINX_PORT_HTTPS=443
ARG TEST_AIO_NGINX_PORT_HTTPS=4433
ARG      AIO_SIGNIFICANT_FILES_PATTERN='^(?:aio|packages)/(?!.*[._]spec\\.[jt]s$)'
ARG TEST_AIO_SIGNIFICANT_FILES_PATTERN=$AIO_SIGNIFICANT_FILES_PATTERN
ARG      AIO_TRUSTED_PR_LABEL="aio: preview"
ARG TEST_AIO_TRUSTED_PR_LABEL=$AIO_TRUSTED_PR_LABEL
ARG      AIO_PREVIEW_SERVER_HOSTNAME=preview.localhost
ARG TEST_AIO_PREVIEW_SERVER_HOSTNAME=$AIO_PREVIEW_SERVER_HOSTNAME
ARG      AIO_ARTIFACT_MAX_SIZE=26214400
ARG TEST_AIO_ARTIFACT_MAX_SIZE=200
ARG      AIO_PREVIEW_SERVER_PORT=3000
ARG TEST_AIO_PREVIEW_SERVER_PORT=3001

ENV AIO_ARTIFACT_PATH=$AIO_ARTIFACT_PATH                          TEST_AIO_ARTIFACT_PATH=$TEST_AIO_ARTIFACT_PATH                          \
    AIO_BUILDS_DIR=$AIO_BUILDS_DIR                                TEST_AIO_BUILDS_DIR=$TEST_AIO_BUILDS_DIR                                \
    AIO_DOMAIN_NAME=$AIO_DOMAIN_NAME                              TEST_AIO_DOMAIN_NAME=$TEST_AIO_DOMAIN_NAME                              \
    AIO_GITHUB_ORGANIZATION=$AIO_GITHUB_ORGANIZATION              TEST_AIO_GITHUB_ORGANIZATION=$TEST_AIO_GITHUB_ORGANIZATION              \
    AIO_GITHUB_REPO=$AIO_GITHUB_REPO                              TEST_AIO_GITHUB_REPO=$TEST_AIO_GITHUB_REPO                              \
    AIO_GITHUB_TEAM_SLUGS=$AIO_GITHUB_TEAM_SLUGS                  TEST_AIO_GITHUB_TEAM_SLUGS=$TEST_AIO_GITHUB_TEAM_SLUGS                  \
    AIO_LOCALCERTS_DIR=/etc/ssl/localcerts                        TEST_AIO_LOCALCERTS_DIR=/etc/ssl/localcerts-test                        \
    AIO_NGINX_HOSTNAME=$AIO_NGINX_HOSTNAME                        TEST_AIO_NGINX_HOSTNAME=$TEST_AIO_NGINX_HOSTNAME                        \
    AIO_NGINX_LOGS_DIR=/var/log/aio/nginx                         TEST_AIO_NGINX_LOGS_DIR=/var/log/aio/nginx-test                         \
    AIO_NGINX_PORT_HTTP=$AIO_NGINX_PORT_HTTP                      TEST_AIO_NGINX_PORT_HTTP=$TEST_AIO_NGINX_PORT_HTTP                      \
    AIO_NGINX_PORT_HTTPS=$AIO_NGINX_PORT_HTTPS                    TEST_AIO_NGINX_PORT_HTTPS=$TEST_AIO_NGINX_PORT_HTTPS                    \
    AIO_SCRIPTS_JS_DIR=/usr/share/aio-scripts-js                                                                                          \
    AIO_SCRIPTS_SH_DIR=/usr/share/aio-scripts-sh                                                                                          \
    AIO_SIGNIFICANT_FILES_PATTERN=$AIO_SIGNIFICANT_FILES_PATTERN  TEST_AIO_SIGNIFICANT_FILES_PATTERN=$TEST_AIO_SIGNIFICANT_FILES_PATTERN  \
    AIO_TRUSTED_PR_LABEL=$AIO_TRUSTED_PR_LABEL                    TEST_AIO_TRUSTED_PR_LABEL=$TEST_AIO_TRUSTED_PR_LABEL                    \
    AIO_PREVIEW_SERVER_HOSTNAME=$AIO_PREVIEW_SERVER_HOSTNAME                      TEST_AIO_PREVIEW_SERVER_HOSTNAME=$TEST_AIO_PREVIEW_SERVER_HOSTNAME                      \
    AIO_ARTIFACT_MAX_SIZE=$AIO_ARTIFACT_MAX_SIZE                      TEST_AIO_ARTIFACT_MAX_SIZE=$TEST_AIO_ARTIFACT_MAX_SIZE                      \
    AIO_PREVIEW_SERVER_PORT=$AIO_PREVIEW_SERVER_PORT                              TEST_AIO_PREVIEW_SERVER_PORT=$TEST_AIO_PREVIEW_SERVER_PORT                              \
    AIO_WWW_USER=www-data                                                                                                                 \
    NODE_ENV=production


# Create directory for logs
RUN mkdir /var/log/aio


# Add extra package sources
RUN apt-get update -y && apt-get install -y curl=7.64.0-4+deb10u1
RUN curl --silent --show-error --location https://deb.nodesource.com/setup_12.x | bash -
RUN curl --silent --show-error https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Install packages
# NOTE: Some packages (such as `nginx`, `nodejs`, `openssl`) make older versions unavailable on the
#       repositories, so we cannot pin to specific versions for these packages :(
#       See for example:
#       - https://github.com/nodesource/distributions/issues/33
#       - https://askubuntu.com/questions/715104/how-can-i-downgrade-openssl-via-apt-get
RUN apt-get update -y && apt-get install -y \
    cron=3.0pl1-134+deb10u1 \
    dnsmasq=2.80-1 \
    nano=3.2-3 \
    nginx \
    nodejs \
    openssl \
    rsyslog=8.1901.0-1 \
    vim=2:8.1.0875-5 \
    yarn=1.22.4-1
RUN yarn global add pm2@4.4.0


# Set up log rotation
COPY logrotate/* /etc/logrotate.d/
RUN chmod 0644 /etc/logrotate.d/*


# Set up cronjobs
COPY cronjobs/aio-builds-cleanup /etc/cron.d/
RUN chmod 0744 /etc/cron.d/aio-builds-cleanup
RUN crontab /etc/cron.d/aio-builds-cleanup
RUN printenv | grep AIO_ >> /etc/environment


# Set up dnsmasq
COPY dnsmasq/dnsmasq.conf /etc/
RUN sed -i "s|{{\$AIO_NGINX_HOSTNAME}}|$AIO_NGINX_HOSTNAME|g" /etc/dnsmasq.conf
RUN sed -i "s|{{\$AIO_PREVIEW_SERVER_HOSTNAME}}|$AIO_PREVIEW_SERVER_HOSTNAME|g" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_NGINX_HOSTNAME}}|$TEST_AIO_NGINX_HOSTNAME|g" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_PREVIEW_SERVER_HOSTNAME}}|$TEST_AIO_PREVIEW_SERVER_HOSTNAME|g" /etc/dnsmasq.conf


# Set up SSL/TLS certificates
COPY nginx/create-selfsigned-cert.sh /tmp/
RUN chmod a+x /tmp/create-selfsigned-cert.sh
RUN /tmp/create-selfsigned-cert.sh "selfcert-prod" "$AIO_NGINX_HOSTNAME" "$AIO_LOCALCERTS_DIR"
RUN /tmp/create-selfsigned-cert.sh "selfcert-test" "$TEST_AIO_NGINX_HOSTNAME" "$TEST_AIO_LOCALCERTS_DIR"
RUN rm /tmp/create-selfsigned-cert.sh
RUN update-ca-certificates


# Set up nginx (for production and testing)
RUN sed -i -E "s|^user\s+\S+;|user $AIO_WWW_USER;|" /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/*
RUN rm -f /etc/nginx/sites-enabled/*

COPY nginx/aio-builds.conf /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$AIO_BUILDS_DIR|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$AIO_DOMAIN_NAME|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_LOCALCERTS_DIR}}|$AIO_LOCALCERTS_DIR|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_LOGS_DIR}}|$AIO_NGINX_LOGS_DIR|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$AIO_NGINX_PORT_HTTP|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$AIO_NGINX_PORT_HTTPS|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_PREVIEW_SERVER_HOSTNAME}}|$AIO_PREVIEW_SERVER_HOSTNAME|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_ARTIFACT_MAX_SIZE}}|$AIO_ARTIFACT_MAX_SIZE|g" /etc/nginx/conf.d/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_PREVIEW_SERVER_PORT}}|$AIO_PREVIEW_SERVER_PORT|g" /etc/nginx/conf.d/aio-builds-prod.conf

COPY nginx/aio-builds.conf /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$TEST_AIO_BUILDS_DIR|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$TEST_AIO_DOMAIN_NAME|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_LOCALCERTS_DIR}}|$TEST_AIO_LOCALCERTS_DIR|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_LOGS_DIR}}|$TEST_AIO_NGINX_LOGS_DIR|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$TEST_AIO_NGINX_PORT_HTTP|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$TEST_AIO_NGINX_PORT_HTTPS|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_PREVIEW_SERVER_HOSTNAME}}|$TEST_AIO_PREVIEW_SERVER_HOSTNAME|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_ARTIFACT_MAX_SIZE}}|$TEST_AIO_ARTIFACT_MAX_SIZE|g" /etc/nginx/conf.d/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_PREVIEW_SERVER_PORT}}|$TEST_AIO_PREVIEW_SERVER_PORT|g" /etc/nginx/conf.d/aio-builds-test.conf


# Set up pm2
RUN pm2 startup --user root > /dev/null


# Set up the shell scripts
COPY scripts-sh/ $AIO_SCRIPTS_SH_DIR/
RUN chmod a+x $AIO_SCRIPTS_SH_DIR/*
RUN find $AIO_SCRIPTS_SH_DIR -maxdepth 1 -type f -printf "%P\n" \
    | while read file; do ln -s $AIO_SCRIPTS_SH_DIR/$file /usr/local/bin/aio-${file%.*}; done


# Set up the Node.js scripts
COPY scripts-js/ $AIO_SCRIPTS_JS_DIR/
RUN yarn --cwd="$AIO_SCRIPTS_JS_DIR/" install --production --frozen-lockfile


# Set up health check
HEALTHCHECK --interval=5m CMD /usr/local/bin/aio-health-check


# Go!
WORKDIR /
CMD aio-init && tail -f /dev/null
