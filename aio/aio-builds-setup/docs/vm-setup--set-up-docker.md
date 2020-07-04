# VM Setup - Set up docker


## Install docker

Official installation instructions: https://docs.docker.com/engine/install
Example:

_Debian (buster):_
- `sudo apt-get update`
- `sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common`
- `curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -`
- `sudo apt-key fingerprint 0EBFCD88`
- `sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"`
- `sudo apt-get update`
- `sudo apt-get -y install docker-ce docker-ce-cli containerd.io`


## Start the docker
- `sudo service docker start`


## Test docker
- `sudo docker run hello-world`


## Start docker on boot
- `sudo systemctl enable docker`
