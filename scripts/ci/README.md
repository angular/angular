# Continuous Integration Scripts

This directory contains scripts that are related to CI only.

| Script            | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| travis-env.sh     | Runs at the beginning of a Travis build to set up the environment.    |
| travis-script.sh  | Main script that Travis will always execute for every job and mode.   |
| travis-testing.sh | Script that controls all jobs inside of the testing build stage.      |
| travis-deploy.sh  | Script that controls all jobs inside of the deploy build stage.       |
