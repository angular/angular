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
