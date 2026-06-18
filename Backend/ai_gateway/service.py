import requests
from django.conf import settings


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

            return response.json()

        except requests.exceptions.HTTPError:

            try:
                return response.json()
            except Exception:
                return {
                    "error": response.text
                }

        except Exception as e:

            return {
                "error": str(e)
            }