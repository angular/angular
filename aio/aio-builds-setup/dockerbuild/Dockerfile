# Image metadata and config
FROM debian:jessie

LABEL name="angular.io PR preview" \
      description="This image implements the PR preview functionality for angular.io." \
      vendor="Angular" \
      version="1.0"

VOLUME /aio-secrets
VOLUME /var/www/aio-builds

EXPOSE 80 443


# Build-time args and env vars
ARG      AIO_BUILDS_DIR=/var/www/aio-builds
ARG TEST_AIO_BUILDS_DIR=/tmp/aio-builds
ARG      AIO_DOMAIN_NAME=ngbuilds.io
ARG TEST_AIO_DOMAIN_NAME=$AIO_DOMAIN_NAME.localhost
ARG      AIO_GITHUB_ORGANIZATION=angular
ARG TEST_AIO_GITHUB_ORGANIZATION=angular
ARG      AIO_GITHUB_TEAM_SLUGS=angular-core,aio-contributors
ARG TEST_AIO_GITHUB_TEAM_SLUGS=angular-core,aio-contributors
ARG      AIO_NGINX_HOSTNAME=$AIO_DOMAIN_NAME
ARG TEST_AIO_NGINX_HOSTNAME=$TEST_AIO_DOMAIN_NAME
ARG      AIO_NGINX_PORT_HTTP=80
ARG TEST_AIO_NGINX_PORT_HTTP=8080
ARG      AIO_NGINX_PORT_HTTPS=443
ARG TEST_AIO_NGINX_PORT_HTTPS=4433
ARG      AIO_REPO_SLUG=angular/angular
ARG TEST_AIO_REPO_SLUG=test-repo/test-slug
ARG      AIO_UPLOAD_HOSTNAME=upload.localhost
ARG TEST_AIO_UPLOAD_HOSTNAME=upload.localhost
ARG      AIO_UPLOAD_MAX_SIZE=20971520
ARG TEST_AIO_UPLOAD_MAX_SIZE=20971520
ARG      AIO_UPLOAD_PORT=3000
ARG TEST_AIO_UPLOAD_PORT=3001

ENV AIO_BUILDS_DIR=$AIO_BUILDS_DIR                     TEST_AIO_BUILDS_DIR=$TEST_AIO_BUILDS_DIR                     \
    AIO_DOMAIN_NAME=$AIO_DOMAIN_NAME                   TEST_AIO_DOMAIN_NAME=$TEST_AIO_DOMAIN_NAME                   \
    AIO_GITHUB_ORGANIZATION=$AIO_GITHUB_ORGANIZATION   TEST_AIO_GITHUB_ORGANIZATION=$TEST_AIO_GITHUB_ORGANIZATION   \
    AIO_GITHUB_TEAM_SLUGS=$AIO_GITHUB_TEAM_SLUGS       TEST_AIO_GITHUB_TEAM_SLUGS=$TEST_AIO_GITHUB_TEAM_SLUGS       \
    AIO_LOCALCERTS_DIR=/etc/ssl/localcerts             TEST_AIO_LOCALCERTS_DIR=/etc/ssl/localcerts-test             \
    AIO_NGINX_HOSTNAME=$AIO_NGINX_HOSTNAME             TEST_AIO_NGINX_HOSTNAME=$TEST_AIO_NGINX_HOSTNAME             \
    AIO_NGINX_LOGS_DIR=/var/log/aio/nginx              TEST_AIO_NGINX_LOGS_DIR=/var/log/aio/nginx-test              \
    AIO_NGINX_PORT_HTTP=$AIO_NGINX_PORT_HTTP           TEST_AIO_NGINX_PORT_HTTP=$TEST_AIO_NGINX_PORT_HTTP           \
    AIO_NGINX_PORT_HTTPS=$AIO_NGINX_PORT_HTTPS         TEST_AIO_NGINX_PORT_HTTPS=$TEST_AIO_NGINX_PORT_HTTPS         \
    AIO_REPO_SLUG=$AIO_REPO_SLUG                       TEST_AIO_REPO_SLUG=$TEST_AIO_REPO_SLUG                       \
    AIO_SCRIPTS_JS_DIR=/usr/share/aio-scripts-js                                                                    \
    AIO_SCRIPTS_SH_DIR=/usr/share/aio-scripts-sh                                                                    \
    AIO_UPLOAD_HOSTNAME=$AIO_UPLOAD_HOSTNAME           TEST_AIO_UPLOAD_HOSTNAME=$TEST_AIO_UPLOAD_HOSTNAME           \
    AIO_UPLOAD_MAX_SIZE=$AIO_UPLOAD_MAX_SIZE           TEST_AIO_UPLOAD_MAX_SIZE=$TEST_AIO_UPLOAD_MAX_SIZE           \
    AIO_UPLOAD_PORT=$AIO_UPLOAD_PORT                   TEST_AIO_UPLOAD_PORT=$TEST_AIO_UPLOAD_PORT                   \
    NODE_ENV=production


# Create directory for logs
RUN mkdir /var/log/aio


# Add extra package sources
RUN apt-get update -y && apt-get install -y curl
RUN curl --silent --show-error --location https://deb.nodesource.com/setup_6.x | bash -
RUN curl --silent --show-error https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Install packages
RUN apt-get update -y && apt-get install -y \
    chkconfig \
    cron \
    dnsmasq \
    nano \
    nginx \
    nodejs \
    openssl \
    rsyslog \
    yarn
RUN yarn global add pm2@2


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
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$AIO_UPLOAD_HOSTNAME|g" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_NGINX_HOSTNAME}}|$TEST_AIO_NGINX_HOSTNAME|g" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_UPLOAD_HOSTNAME}}|$TEST_AIO_UPLOAD_HOSTNAME|g" /etc/dnsmasq.conf


# Set up SSL/TLS certificates
COPY nginx/create-selfsigned-cert.sh /tmp/
RUN chmod a+x /tmp/create-selfsigned-cert.sh
RUN /tmp/create-selfsigned-cert.sh "selfcert-prod" "$AIO_NGINX_HOSTNAME" "$AIO_LOCALCERTS_DIR"
RUN /tmp/create-selfsigned-cert.sh "selfcert-test" "$TEST_AIO_NGINX_HOSTNAME" "$TEST_AIO_LOCALCERTS_DIR"
RUN rm /tmp/create-selfsigned-cert.sh
RUN update-ca-certificates


# Set up nginx (for production and testing)
RUN rm /etc/nginx/sites-enabled/*

COPY nginx/aio-builds.conf /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$AIO_BUILDS_DIR|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$AIO_DOMAIN_NAME|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_LOCALCERTS_DIR}}|$AIO_LOCALCERTS_DIR|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_LOGS_DIR}}|$AIO_NGINX_LOGS_DIR|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$AIO_NGINX_PORT_HTTP|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$AIO_NGINX_PORT_HTTPS|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$AIO_UPLOAD_HOSTNAME|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_MAX_SIZE}}|$AIO_UPLOAD_MAX_SIZE|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_PORT}}|$AIO_UPLOAD_PORT|g" /etc/nginx/sites-available/aio-builds-prod.conf
RUN ln -s /etc/nginx/sites-available/aio-builds-prod.conf /etc/nginx/sites-enabled/aio-builds-prod.conf

COPY nginx/aio-builds.conf /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$TEST_AIO_BUILDS_DIR|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$TEST_AIO_DOMAIN_NAME|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_LOCALCERTS_DIR}}|$TEST_AIO_LOCALCERTS_DIR|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_LOGS_DIR}}|$TEST_AIO_NGINX_LOGS_DIR|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$TEST_AIO_NGINX_PORT_HTTP|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$TEST_AIO_NGINX_PORT_HTTPS|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$TEST_AIO_UPLOAD_HOSTNAME|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_MAX_SIZE}}|$TEST_AIO_UPLOAD_MAX_SIZE|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_PORT}}|$TEST_AIO_UPLOAD_PORT|g" /etc/nginx/sites-available/aio-builds-test.conf
RUN ln -s /etc/nginx/sites-available/aio-builds-test.conf /etc/nginx/sites-enabled/aio-builds-test.conf


# Set up pm2
RUN pm2 startup systemv -u root > /dev/null
RUN chkconfig pm2-root on


# Set up the shell scripts
COPY scripts-sh/ $AIO_SCRIPTS_SH_DIR/
RUN chmod a+x $AIO_SCRIPTS_SH_DIR/*
RUN find $AIO_SCRIPTS_SH_DIR -maxdepth 1 -type f -printf "%P\n" \
    | while read file; do ln -s $AIO_SCRIPTS_SH_DIR/$file /usr/local/bin/aio-${file%.*}; done


# Set up the Node.js scripts
COPY scripts-js/ $AIO_SCRIPTS_JS_DIR/
WORKDIR $AIO_SCRIPTS_JS_DIR/
RUN yarn install --production


# Set up health check
HEALTHCHECK --interval=5m CMD /usr/local/bin/aio-health-check


# Go!
WORKDIR /
CMD aio-init && tail -f /dev/null
