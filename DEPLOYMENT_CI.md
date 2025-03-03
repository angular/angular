# Déploiement automatisé avec CI/CD

Ce document décrit la configuration du déploiement automatisé.

## Pipeline CI/CD

Notre application utilise GitHub Actions pour automatiser le déploiement.

## Configuration requise

- Secrets GitHub pour les credentials Docker Hub
- Secrets GitHub pour l'accès SSH au serveur

## Étapes du pipeline

1. Compilation et tests
2. Construction de l'image Docker
3. Push vers Docker Hub
4. Déploiement automatique en production
