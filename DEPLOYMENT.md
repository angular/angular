# Guide de déploiement de l'application

Ce document explique comment déployer l'application en environnement de production.

## Prérequis

- Docker 20.10+
- Un compte sur Docker Hub
- Accès au serveur de production

## Étapes de déploiement manuel

1. Construire l'image Docker
   ```bash
   docker build -t angular-app:latest .
   
Tester l'image localement
docker run -p 4200:80 angular-app:latest
Pousser l'image vers Docker Hub
docker tag angular-app:latest username/angular-app:latest
docker push username/angular-app:latest
Déployer sur le serveur
ssh user@production-server
docker pull username/angular-app:latest
docker stop angular-app || true
docker rm angular-app || true
docker run -d --name angular-app -p 80:80 username/angular-app:latest

