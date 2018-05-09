# Link the scripts on the host to the scripts in the container
#  - the host scripts are mounted as a volume at `/dockerbuild`)
#  - the original scripts are moved to `..._prod` in case they are needed later
# See `aio/aio-builds-setup/docs/misc--debug-docker-container.md` for more info

mv $AIO_SCRIPTS_SH_DIR ${AIO_SCRIPTS_SH_DIR}_prod
ln -s /dockerbuild/scripts-sh $AIO_SCRIPTS_SH_DIR
chmod a+x $AIO_SCRIPTS_SH_DIR/*

mv $AIO_SCRIPTS_JS_DIR ${AIO_SCRIPTS_JS_DIR}_prod
ln -s /dockerbuild/scripts-js $AIO_SCRIPTS_JS_DIR

