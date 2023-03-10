FROM node:fermium-slim as base

LABEL "com.github.actions.name"="Vuepress deploy"
LABEL "com.github.actions.description"="A GitHub Action to build and deploy Vuepress sites to GitHub Pages"
LABEL "com.github.actions.icon"="upload-cloud"
LABEL "com.github.actions.color"="gray-dark"

RUN apt-get update && apt-get install -y git jq

COPY deploy.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
