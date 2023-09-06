import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ghostchat')
websocket_endpoint = os.environ['WEBSOCKET_ENDPOINT']
client = boto3.client('apigatewaymanagementapi',
                      endpoint_url=websocket_endpoint)


def lambda_handler(event, context):

    connection_id = event["requestContext"]["connectionId"]

    response = table.scan()
    threads = response['Items']

    output = {
        'action': 'ghostchat-list-all',
        'threads': threads
    }

    # Send data to the connected WebSocket client
    client.post_to_connection(
        ConnectionId=connection_id,
        Data=json.dumps(output)
    )

    return {}
