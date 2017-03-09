# VM Setup - Set up docker


## Install docker

_Debian (jessie):_
- `sudo apt-get update`
- `sudo apt-get install -y apt-transport-https ca-certificates curl git software-properties-common`
- `curl -fsSL https://apt.dockerproject.org/gpg | sudo apt-key add -`
- `apt-key fingerprint 58118E89F3A912897C070ADBF76221572C52609D`
- `sudo add-apt-repository "deb https://apt.dockerproject.org/repo/ debian-$(lsb_release -cs) main"`
- `sudo apt-get update`
- `sudo apt-get -y install docker-engine`

_Ubuntu (16.04):_
- `sudo apt-get update`
- `sudo apt-get install -y curl git linux-image-extra-$(uname -r) linux-image-extra-virtual`
- `sudo apt-get install -y apt-transport-https ca-certificates`
- `curl -fsSL https://yum.dockerproject.org/gpg | sudo apt-key add -`
- `apt-key fingerprint 58118E89F3A912897C070ADBF76221572C52609D`
- `sudo add-apt-repository "deb https://apt.dockerproject.org/repo/ ubuntu-$(lsb_release -cs) main"`
- `sudo apt-get update`
- `sudo apt-get -y install docker-engine`


## Start the docker
- `sudo service docker start`


## Test docker
- `sudo docker run hello-world`


## Start docker on boot
- `sudo systemctl enable docker`
