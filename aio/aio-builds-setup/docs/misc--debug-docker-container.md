# Miscellaneous - Debug docker container


TODO (gkalpak): Add docs. Mention:
- `aio-health-check`
- `aio-verify-setup`
- Test nginx accessible at:
  - `http://$TEST_AIO_NGINX_HOTNAME:$TEST_AIO_NGINX_PORT_HTTP`
  - `https://$TEST_AIO_NGINX_HOTNAME:$TEST_AIO_NGINX_PORT_HTTPS`
- Test upload-server accessible at:
  - `http://$TEST_AIO_UPLOAD_HOTNAME:$TEST_AIO_UPLOAD_PORT`
- Local DNS (via dnsmasq) maps the above hostnames to 127.0.0.1


## Developing the upload server TypeScript files

If you are running Docker on OS/X then you can benefit from linking the built TypeScript
files (i.e. `script-js/dist`) to the JavaScript files inside the Docker container.

First start watching and building the TypeScript files (in the host):

```bash
yarn build-watch
```

Now build, start and attach to the Docker container. See "Setting up the VM"
section in [TOC](_TOC.md). Then link the JavaScript folders (in the container):

```bash
aio-dev-mode
```

Now whenever you make changes to the TypeScript, it will be automatically built
in the host, and the changes are automatically available in the container.
You can then run the unit tests (in the container):

```bash
aio-verify-setup
```

Sometimes, the errors in the unit test log are not enough to tell you what went wrong.
In that case you can also look at the log of the upload-server itself.
A helper script that runs the unit tests (i.e. `aio-verify-setup`) and displays the
last relevant test-upload-server log is:

```bash
aio-verify-setup-and-log
```
