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
        body = json.loads(event['body'])
        self_connection_id = event['requestContext']['connectionId']
        threadId = str(body['threadId'])
        reply_content = body['data']['content']
        replyId = str(body['data']['replyId'])
        author = body['data']['author']
        timestamp = datetime.now().isoformat()

        reply = {
            'replyId': replyId,
            'content': reply_content,
            'author': author,
            'timestamp': timestamp
        }

        response = table.update_item(
            Key={'threadId': threadId},
            UpdateExpression="SET replies = list_append(if_not_exists(replies, :empty_list), :r)",
            ExpressionAttributeValues={
                ':r': [reply],
                ':empty_list': []
            },
            ReturnValues="UPDATED_NEW"
        )

        broadcast_data = json.dumps({
            "action": "new_reply",
            "threadId": threadId,
            "reply": reply
        })

        connected_clients = connected_clients_table.scan()['Items']

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

        item = table.get_item(Key={'threadId': threadId}).get('Item')
        telegram_message_id = item.get('telegramMessageId')
        thread_url = f"http://localhost:5173/thread/{threadId}"
        reply_text = f"Echo from {author}\n\n{reply_content}\nClick {thread_url} to echo."
        send_telegram_reply(telegram_message_id, reply_text)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Reply added successfully'
            })
        }

    except Exception as e:
        print(f"Error processing the request: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Internal server error',
                'error': str(e)
            })
        }


def send_telegram_reply(telegram_message_id, reply_text):
    bot_token = ssm.get_parameter(
        Name='telagram-bot-token-coderautobot', WithDecryption=True)['Parameter']['Value']
    chat_id = ssm.get_parameter(
        Name='telagram-chatid-testbed')['Parameter']['Value']
    base_url = f"https://api.telegram.org/{bot_token}/sendMessage"

    response = requests.post(base_url, data={
        "chat_id": chat_id,
        "text": reply_text,
        "reply_to_message_id": telegram_message_id
    })

    if response.status_code != 200:
        raise Exception(
            f"Failed to send Telegram reply. Status code: {response.status_code}, Response: {response.text}")
