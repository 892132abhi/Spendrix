import requests
from django.conf import settings
from rest_framework import status


class AIServiceClient:

    BASE_URL = settings.AI_SERVICE_URL

    @classmethod
    def post(cls, endpoint, **kwargs):

        try:
            response = requests.post(
                f"{cls.BASE_URL}{endpoint}",
                timeout=120,
                **kwargs
            )

            response.raise_for_status()

            return response.json(), status.HTTP_200_OK

        except requests.exceptions.HTTPError:
            try:
                error_body = response.json()
            except Exception:
                error_body = {"error": response.text}
            return error_body, response.status_code

        except requests.exceptions.Timeout:
            return {"error": "AI service timed out. Please try again."}, status.HTTP_504_GATEWAY_TIMEOUT

        except requests.exceptions.ConnectionError:
            return {"error": "AI service is unreachable."}, status.HTTP_502_BAD_GATEWAY

        except Exception as e:
            return {"error": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR