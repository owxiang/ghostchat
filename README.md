# GhostChat

## Overview

[GhostChat](https://main..amplifyapp.com/) is a live forum-like application with whispers(threads), echos(replies) and ghosts(authors).

## Technologies

- AWS Lambda
  - See codes [here](https://github.com/owxiang/ghostchat/tree/main/lambdas).
- AWS DynamoDB
- AWS API Gateway with WebSocket
- AWS Systems Manager
- AWS Amplify
- React + TypeScript + Vite
- Python

## Cloud Architecture

## Getting Started

```
git clone https://github.com/owxiang/ghostchat.git
cd ghostchat
npm install
npm run dev
```

## Usage

Enter your ghostly name and start a new whisper or echo to existing ones.

Use the search bar to find old whisper, echos or ghosts.

## Configurations for backend

**Local Environment variables**

Create a `.env` file at the root of project.

Add API Gateway Invoke URL to this file:

`VITE_APP_WEBSOCKET_URL = API_GATEWAY_INVOKE_URL`

**Amplify Environment variables**

Click on "Environment variables" to manage environment variables.

Click on the "Edit" button, and then "Add environment variable". Input the name and value for environment variable for API Gateway Invoke URL:

Name: `VITE_APP_WEBSOCKET_URL`

Value: `API_GATEWAY_INVOKE_URL`

## Future Work

- Slack integration for notification.
  - Telegram is working with echos quoting whisper.
