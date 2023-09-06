# GhostChat

## Overview

[GhostChat](https://main..amplifyapp.com/) is a real-time chat application with whispers and ehocs. Built with React, WebSocket, and AWS Lambda, it provides a supernatural chatting experience!

## Technologies

- AWS Lambda
  - See codes [here](https://github.com/owxiang//tree/main/aws).
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

Enter your ghostly name and start a new thread or reply to existing ones.

Use the search bar to find old threads or replies.

## Configurations

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
