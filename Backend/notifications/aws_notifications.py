import json
import boto3
from django.conf import settings

sns = boto3.client(
    "sns",
    region_name=settings.AWS_S3_REGION_NAME,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def send_push_notification(user, title, message):
    tokens = user.fcm_tokens.all()

    for token_obj in tokens:
        sns.publish(
            TopicArn=settings.AWS_SNS_TOPIC_ARN,
            Message=json.dumps({
                "token": token_obj.token,
                "title": title,
                "message": message
            })
        )