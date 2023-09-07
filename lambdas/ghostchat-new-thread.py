import boto3
import json
from datetime import datetime
import os
import requests

ssm = boto3.client('ssm')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ghostchat')
connected_clients_table = dynamodb.Table('ghostchat-connectedclients')

websocket_endpoint = os.environ['WEBSOCKET_ENDPOINT']
client = boto3.client('apigatewaymanagementapi',
                      endpoint_url=websocket_endpoint)


def lambda_handler(event, context):
    try:
        self_connection_id = event['requestContext']['connectionId']
        body = json.loads(event['body'])
        content = body['data']['content']
        author = body['data']['author']
        timestamp = body['data']['timestamp']
        threadId = str(body['data']['threadId'])
        telegram_message_id = str(
            send_telegram_notification(threadId, author, content))

        table.put_item(
            Item={
                'threadId': threadId,
                'content': content,
                'author': author,
                'timestamp': timestamp,
                'replies': [],
                'telegramMessageId': telegram_message_id
            }
        )

        connected_clients = connected_clients_table.scan()['Items']

        broadcast_data = json.dumps({
            "message": "Thread created successfully",
            "threadId": threadId,
            "content": content,
            'author': author,
            "timestamp": timestamp
        })

        for client_item in connected_clients:
            client_connection_id = client_item['connection_id']

            # Check if the current connection_id is the same as self_connection_id
            if client_connection_id == self_connection_id:
                continue  # Skip this iteration and move to the next one

            try:
                client.post_to_connection(
                    Data=broadcast_data,
                    ConnectionId=client_connection_id
                )
            except Exception as broadcast_error:
                print("Error broadcasting to client:",
                      client_connection_id, "Error:", str(broadcast_error))

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Thread created successfully',
                'threadId': threadId
            })
        }

    except Exception as e:
        print("Error:", e)

        connection_id = event["requestContext"].get("connectionId")
        client.post_to_connection(
            Data=json.dumps({
                "message": "Error creating thread",
                "error": str(e)
            }),
            ConnectionId=connection_id
        )

        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }


def send_telegram_notification(threadId, author, content):
    bot_token = ssm.get_parameter(
        Name='telagram-bot-token-coderautobot', WithDecryption=True)['Parameter']['Value']
    chat_id = ssm.get_parameter(
        Name='telagram-chatid-testbed')['Parameter']['Value']

    base_url = "https://main.d3pzs3i3v2h1ic.amplifyapp.com/"
    thread_url = f"{base_url}/thread/{threadId}"

    message = f"Whisper from {author}\n\n{content}\nClick [here]({thread_url}) to echo"
    # message = f"Whisper from {author}\n\n{content}\nClick {thread_url} to echo."

    response = requests.get(
        f"https://api.telegram.org/{bot_token}/sendMessage?chat_id={chat_id}&text="
        + f"{message}"
        + "&parse_mode=markdown&disable_web_page_preview=True&disable_notification=true"
    )

    if response.status_code != 200:
        raise Exception(
            f"Failed to send Telegram notification. Status code: {response.status_code}, Response: {response.text}")

    return response.json().get("result", {}).get("message_id")
