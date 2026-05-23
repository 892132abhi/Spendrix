from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        
        if header is None:
            cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
            raw_token = request.COOKIES.get(cookie_name)
            print(f"DEBUG: Checking cookie '{cookie_name}'. Found: {raw_token is not None}")
        else:
            raw_token = self.get_raw_token(header)
            
        if raw_token is None:
            return None
        
        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            print(f"DEBUG: User {user.username} authenticated successfully via cookie.")
            return user, validated_token
        except Exception as e:
            print(f"DEBUG: Token validation failed: {str(e)}")
            return None