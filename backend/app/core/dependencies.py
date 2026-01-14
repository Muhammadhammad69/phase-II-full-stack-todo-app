
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.exceptions import UserNotFoundException
from app.core.security import extract_user_from_token
from app.db.database import get_session
from app.models.user import User

security = HTTPBearer()
session_dep = Depends(get_session)
security_dep = Depends(security)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = security_dep,
    session: AsyncSession = session_dep
) -> str:
    """
    Get current user from token and verify they exist in the database
    """
    token = credentials.credentials
    # print("Token received in dependency:", token)
    user_email = extract_user_from_token(token)

    # Verify user exists in database
    statement = select(User).where(User.email == user_email)
    result = await session.execute(statement)
    user = result.first()

    if user is None:
        raise UserNotFoundException(detail="User not found")

    return user_email
