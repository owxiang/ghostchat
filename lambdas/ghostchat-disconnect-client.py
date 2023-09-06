import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ghostchat-connectedclients')


def lambda_handler(event, context):
    connection_id = event['requestContext']['connectionId']

    table.delete_item(
        Key={
            'connection_id': connection_id
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Disconnected!'})
    }
