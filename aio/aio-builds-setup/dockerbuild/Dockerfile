# Image metadata and config
FROM debian:jessie

LABEL name="angular.io PR preview" \
      description="This image implements the PR preview functionality for angular.io." \
      vendor="Angular" \
      version="1.0"

VOLUME /aio-secrets
VOLUME /var/www/aio-builds

EXPOSE 80 443

ENV AIO_BUILDS_DIR=/var/www/aio-builds             TEST_AIO_BUILDS_DIR=/tmp/aio-builds         \
    AIO_DOMAIN_NAME=ngbuilds.io                    TEST_AIO_DOMAIN_NAME=test-ngbuilds.io       \
    AIO_GITHUB_ORGANIZATION=angular                TEST_AIO_GITHUB_ORGANIZATION=angular        \
    AIO_GITHUB_TEAM_SLUGS=angular-core             TEST_AIO_GITHUB_TEAM_SLUGS=angular-core     \
    AIO_NGINX_HOSTNAME=nginx.localhost             TEST_AIO_NGINX_HOSTNAME=nginx.localhost     \
    AIO_NGINX_PORT_HTTP=80                         TEST_AIO_NGINX_PORT_HTTP=8080               \
    AIO_NGINX_PORT_HTTPS=443                       TEST_AIO_NGINX_PORT_HTTPS=4433              \
    AIO_REPO_SLUG=angular/angular                  TEST_AIO_REPO_SLUG=                         \
    AIO_SCRIPTS_JS_DIR=/usr/share/aio-scripts-js                                               \
    AIO_SCRIPTS_SH_DIR=/usr/share/aio-scripts-sh                                               \
    AIO_UPLOAD_HOSTNAME=upload.localhost           TEST_AIO_UPLOAD_HOSTNAME=upload.localhost   \
    AIO_UPLOAD_MAX_SIZE=20971520                   TEST_AIO_UPLOAD_MAX_SIZE=20971520           \
    AIO_UPLOAD_PORT=3000                           TEST_AIO_UPLOAD_PORT=3001                   \
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
RUN yarn global add pm2


# Set up cronjobs
COPY cronjobs/aio-builds-cleanup /etc/cron.d/
RUN chmod 0744 /etc/cron.d/aio-builds-cleanup
RUN crontab /etc/cron.d/aio-builds-cleanup


# Set up dnsmasq
COPY dnsmasq/dnsmasq.conf /etc/dnsmasq.conf
RUN sed -i "s|{{\$AIO_NGINX_HOSTNAME}}|$AIO_NGINX_HOSTNAME|" /etc/dnsmasq.conf
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$AIO_UPLOAD_HOSTNAME|" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_NGINX_HOSTNAME}}|$TEST_AIO_NGINX_HOSTNAME|" /etc/dnsmasq.conf
RUN sed -i "s|{{\$TEST_AIO_UPLOAD_HOSTNAME}}|$TEST_AIO_UPLOAD_HOSTNAME|" /etc/dnsmasq.conf


# Set up SSL/TLS certificates
RUN mkdir -p /etc/ssl/localcerts
RUN openssl req -days 365 -newkey rsa:2048 -nodes -sha256 -x509 -subj "/CN=$AIO_NGINX_HOSTNAME" \
                -out /etc/ssl/localcerts/$AIO_DOMAIN_NAME.crt \
                -keyout /etc/ssl/localcerts/$AIO_DOMAIN_NAME.key
RUN openssl req -days 365 -newkey rsa:2048 -nodes -sha256 -x509 -subj "/CN=$TEST_AIO_NGINX_HOSTNAME" \
                -out /etc/ssl/localcerts/$TEST_AIO_DOMAIN_NAME.crt \
                -keyout /etc/ssl/localcerts/$TEST_AIO_DOMAIN_NAME.key
RUN chmod -R 400 /etc/ssl/localcerts
RUN cp /etc/ssl/localcerts/*.crt /usr/local/share/ca-certificates
RUN update-ca-certificates


# Set up nginx (for production and testing)
RUN rm /etc/nginx/sites-enabled/*

COPY nginx/aio-builds.conf /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$AIO_BUILDS_DIR|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$AIO_DOMAIN_NAME|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$AIO_NGINX_PORT_HTTP|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$AIO_NGINX_PORT_HTTPS|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$AIO_UPLOAD_HOSTNAME|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_MAX_SIZE}}|$AIO_UPLOAD_MAX_SIZE|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN sed -i "s|{{\$AIO_UPLOAD_PORT}}|$AIO_UPLOAD_PORT|" /etc/nginx/sites-available/aio-builds-prod.conf
RUN ln -s /etc/nginx/sites-available/aio-builds-prod.conf /etc/nginx/sites-enabled/aio-builds-prod.conf

COPY nginx/aio-builds.conf /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_BUILDS_DIR}}|$TEST_AIO_BUILDS_DIR|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_DOMAIN_NAME}}|$TEST_AIO_DOMAIN_NAME|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTP}}|$TEST_AIO_NGINX_PORT_HTTP|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_NGINX_PORT_HTTPS}}|$TEST_AIO_NGINX_PORT_HTTPS|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_HOSTNAME}}|$TEST_AIO_UPLOAD_HOSTNAME|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_MAX_SIZE}}|$TEST_AIO_UPLOAD_MAX_SIZE|" /etc/nginx/sites-available/aio-builds-test.conf
RUN sed -i "s|{{\$AIO_UPLOAD_PORT}}|$TEST_AIO_UPLOAD_PORT|" /etc/nginx/sites-available/aio-builds-test.conf
RUN ln -s /etc/nginx/sites-available/aio-builds-test.conf /etc/nginx/sites-enabled/aio-builds-test.conf


# Set up pm2
RUN pm2 startup systemv -u root > /dev/null \
    # Ugly!
    || echo " ---> Working around https://github.com/Unitech/pm2/commit/a788e523e#commitcomment-20851443" \
       && chkconfig --add pm2 > /dev/null
RUN chkconfig pm2 on


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
