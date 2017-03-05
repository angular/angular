# VM Setup Instructions

- Set up secrets (access tokens, passwords, etc)
- Set up docker
- Attach persistent disk
- Build docker image (+ checkout repo)
- Run image (+ setup for run on boot)


## Build image
- `<aio-builds-setup-dir>/build.sh [<name>[:<tag>] [--build-arg <NAME>=<value> ...]]`


## Run image
- `sudo docker run \
     -d \
     --dns 127.0.0.1 \
     --name <instance-name> \
     -p 80:80 \
     -p 443:443 \
     --restart unless-stopped \
    [-v <host-cert-dir>:/etc/ssl/localcerts:ro] \
     -v <host-secrets-dir>:/aio-secrets:ro \
     -v <host-builds-dir>:/var/www/aio-builds \
     <name>[:<tag>]
  `


## Questions
- Do we care to keep logs (e.g. cron, nginx, aio-upload-server, aio-clean-up, pm2) outside of the container?
- Instead of creating new comments for each commit, update the original comment?
