import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import (
    DatabaseException,
    TaskNotFoundException,
    TokenExpiredException,
    TokenInvalidException,
    UserNotFoundException,
    ValidationException,
)

logger = logging.getLogger(__name__)


async def token_invalid_exception_handler(request: Request, exc: TokenInvalidException):
    """
    Handle TokenInvalidException
    """
    logger.warning(f"Token invalid: {exc.detail}")
    return JSONResponse(
        status_code=401,
        content={
            "success": False,
            "error": {
                "code": "TOKEN_INVALID",
                "message": exc.detail
            }
        }
    )


async def token_expired_exception_handler(request: Request, exc: TokenExpiredException):
    """
    Handle TokenExpiredException
    """
    logger.warning(f"Token expired: {exc.detail}")
    return JSONResponse(
        status_code=401,
        content={
            "success": False,
            "error": {
                "code": "TOKEN_EXPIRED",
                "message": exc.detail
            }
        }
    )


async def user_not_found_exception_handler(
    request: Request,
    exc: UserNotFoundException
):
    """
    Handle UserNotFoundException
    """
    logger.info(f"User not found: {exc.detail}")
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "USER_NOT_FOUND",
                "message": exc.detail
            }
        }
    )


async def task_not_found_exception_handler(
    request: Request,
    exc: TaskNotFoundException
):
    """
    Handle TaskNotFoundException
    """
    logger.info(f"Task not found: {exc.detail}")
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "TASK_NOT_FOUND",
                "message": exc.detail
            }
        }
    )


async def validation_exception_handler(request: Request, exc: ValidationException):
    """
    Handle ValidationException
    """
    logger.warning(f"Validation error: {exc.detail}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": exc.detail
            }
        }
    )


async def database_exception_handler(request: Request, exc: DatabaseException):
    """
    Handle DatabaseException
    """
    logger.error(f"Database error: {exc.detail}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "DATABASE_ERROR",
                "message": exc.detail
            }
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle general HTTP exceptions
    """
    logger.warning(f"HTTP error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail or f"HTTP {exc.status_code} error"
            }
        }
    )


async def validation_error_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors
    """
    logger.warning(f"Request validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "REQUEST_VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": exc.errors()
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle general exceptions
    """
    logger.error(f"General error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred"
            }
        }
    )


def register_exception_handlers(app: FastAPI):
    """
    Register all exception handlers with the FastAPI app
    """
    app.add_exception_handler(TokenInvalidException, token_invalid_exception_handler)
    app.add_exception_handler(TokenExpiredException, token_expired_exception_handler)
    app.add_exception_handler(UserNotFoundException, user_not_found_exception_handler)
    app.add_exception_handler(TaskNotFoundException, task_not_found_exception_handler)
    app.add_exception_handler(ValidationException, validation_exception_handler)
    app.add_exception_handler(DatabaseException, database_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)
