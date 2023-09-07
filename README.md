# GhostChat

## Overview

[GhostChat](https://main.d3pzs3i3v2h1ic.amplifyapp.com/) is a live discussion board that introduces a _supernatural_ concept with whispers (threads), echoes (replies), and ghosts (authors).

## Potential use cases

- Anonymous Corporate Feedback
- Whistleblower Platform
- Confessions or Secrets Sharing
- Anonymous Support Group

## Technologies

- AWS Lambda: View the codes [here](https://github.com/owxiang/ghostchat/tree/main/lambdas).
- AWS DynamoDB
- AWS API Gateway with WebSocket
- AWS Systems Manager
- AWS Amplify
- React + TypeScript + Vite
- Python

## Cloud Architecture

![ghostchat drawio (1)](https://github.com/owxiang/ghostchat/assets/22820037/2e80187a-15bd-413b-914d-6eff8eba426f)

## Getting Started

To get GhostChat up and running locally, follow these steps:

1. Clone the repository:

```
git clone https://github.com/owxiang/ghostchat.git
cd ghostchat
```

2. Install project dependencies:

```
npm install
```

3. Start the development server:

```
npm run dev
```

## Usage

Open GhostChat in your browser.

Enter your ghostly name and start a new whisper or reply to existing ones.

Utilize the search bar to find previous whispers, echoes, or ghosts.

## Configurations for backend

**Local Environment variables**

Create a .env file at the root of the project and add your API Gateway Invoke URL:

```
VITE_APP_WEBSOCKET_URL=API_GATEWAY_INVOKE_URL
```

**Amplify Environment variables**

1. Access the Amplify environment variable management interface.

2. Click the "Edit" button and then "Add environment variable."

3. Set the following environment variable for the API Gateway Invoke URL:

`Name`: `VITE_APP_WEBSOCKET_URL`

`Value`: `API_GATEWAY_INVOKE_URL`

## Future Work

- Slack integration for notification.
  - Telegram is working for new echoes quoting whispers.
