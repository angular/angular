# VM Setup Instructions

- Set up docker
- Attach persistent disk
- Build docker image (+ checkout repo)
- Run image (+ setup for run on boot)


## Build image
- `<aio-builds-setup-dir>/build.sh [<name>[:<tag>]]`


## Run image
- `sudo docker run \
     -d \
     --dns 127.0.0.1 \
     --name <instance-name> \
     -p 80:80 \
     -p 443:443 \
     -v <host-snapshots-dir>:/var/www/aio-builds \
     <name>[:<tag>]
  `

## Questions
- Do we care to keep logs (e.g. cron, nginx, aio-upload-server, aio-clean-up, pm2) outside of the container?
- Currently, builds will only be remove when the PR is closed. It is possible to upload arbitrary builds (for non-existent commits) until then.
- Instead of creating new comments for each commit, update the original comment?
- Do we need a static IP address?
- Do we care about persistent disk automatic backup?
