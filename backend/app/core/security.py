from typing import Optional

import jwt

from app.config import settings
from app.core.exceptions import TokenExpiredException, TokenInvalidException


def decode_jwt(token: str) -> Optional[dict]:
    """
    Decode and validate JWT token
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException(detail="Token has expired") from None
    except jwt.PyJWTError:
        raise TokenInvalidException(detail="Could not validate credentials") from None


def extract_user_from_token(token: str) -> Optional[str]:
    """
    Extract user email from token
    """
   
    payload = decode_jwt(token)
    
    user_email: str = payload.get("email")
    if user_email is None:
        raise TokenInvalidException(detail="Could not validate credentials") from None
    return user_email
