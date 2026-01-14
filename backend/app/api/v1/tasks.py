from datetime import date, datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.dependencies import get_current_user
from app.core.exceptions import TaskNotFoundException
from app.db.database import get_session
from app.models.task import PriorityEnum, Task
from app.schemas.task import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# Create dependency instances to avoid B008 error
current_user_dep = Depends(get_current_user)
session_dep = Depends(get_session)


@router.post("/",
             response_model=TaskResponse,
             summary="Create a new task",
             description="Create a new task for the authenticated user. "
                        "The task will be associated with the user's email "
                        "extracted from the JWT token.",
             responses={
                 200: {
                     "description": "Task created successfully",
                     "model": TaskResponse
                 },
                 401: {"description": "Unauthorized - Invalid or expired token"},
                 422: {"description": "Validation error - Invalid input data"}
             })
async def create_task(
    task_data: TaskCreate,
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep
):
    """
    Create a new task for the authenticated user

    Args:
        task_data: Task creation data including title, description,
                   priority, and due date
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation

    Returns:
        TaskResponse: The created task with all details

    Raises:
        HTTPException: If validation fails
    """
    task = Task(
        user_email=current_user,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        due_date=task_data.due_date
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


@router.get("/",
            response_model=TaskListResponse,
            summary="List user's tasks",
            description="Retrieve a paginated list of tasks for the authenticated user "
                       "with optional filtering.",
            responses={
                200: {
                    "description": "List of tasks retrieved successfully",
                    "model": TaskListResponse
                },
                401: {"description": "Unauthorized - Invalid or expired token"}
            })
async def list_tasks(
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep,
    completed: Optional[bool] = None,
    priority: Optional[PriorityEnum] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    page: int = 1,
    page_size: int = 20
):
    """
    List all tasks for the authenticated user with filtering and pagination

    Args:
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation
        completed: Filter by completion status (true/false/all)
        priority: Filter by priority level (low/medium/high)
        date_from: Filter tasks created after this date
        date_to: Filter tasks created before this date
        page: Page number for pagination (default: 1)
        page_size: Number of items per page (default: 20)

    Returns:
        TaskListResponse: Paginated list of tasks with metadata
    """
    statement = select(Task).where(Task.user_email == current_user)

    # Apply filters
    if completed is not None:
        statement = statement.where(Task.is_completed == completed)

    if priority is not None:
        statement = statement.where(Task.priority == priority)

    if date_from is not None:
        statement = statement.where(
            Task.created_at >= datetime.combine(date_from, datetime.min.time())
        )

    if date_to is not None:
        statement = statement.where(
            Task.created_at <= datetime.combine(date_to, datetime.max.time())
        )

    # Apply pagination
    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)

    tasks = await session.exec(statement)
    tasks = tasks.all()

    # Get total count for pagination metadata
    count_statement = select(Task).where(Task.user_email == current_user)
    if completed is not None:
        count_statement = count_statement.where(Task.is_completed == completed)
    if priority is not None:
        count_statement = count_statement.where(Task.priority == priority)
    if date_from is not None:
        count_statement = count_statement.where(
            Task.created_at >= datetime.combine(date_from, datetime.min.time())
        )
    if date_to is not None:
        count_statement = count_statement.where(
            Task.created_at <= datetime.combine(date_to, datetime.max.time())
        )

    total_count_result = await session.exec(count_statement)
    total_count_result = total_count_result.all()
    total_count = len(total_count_result)

    # Convert Task models to TaskResponse models to ensure proper serialization
    # Use model_validate with from_attributes=True to handle SQLModel objects
    task_responses = [
        TaskResponse.model_validate(task, from_attributes=True) for task in tasks
    ]

    return TaskListResponse(
        tasks=task_responses,
        total_count=total_count,
        page=page,
        page_size=page_size
    )


@router.get("/{task_id}",
           response_model=TaskResponse,
           summary="Get a specific task",
           description="Retrieve details of a specific task by its ID. "
                      "The task must belong to the authenticated user.",
           responses={
               200: {
                   "description": "Task retrieved successfully",
                   "model": TaskResponse
               },
               401: {"description": "Unauthorized - Invalid or expired token"},
               404: {"description": "Task not found"}
           })
async def get_task(
    task_id: UUID,
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep
):
    """
    Get a specific task by ID for the authenticated user

    Args:
        task_id: UUID of the task to retrieve
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation

    Returns:
        TaskResponse: The requested task details

    Raises:
        TaskNotFoundException: If the task doesn't exist or doesn't belong to the user
    """
    statement = select(Task).where(Task.id == task_id, Task.user_email == current_user)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFoundException(detail=f"Task with id {task_id} not found")

    return TaskResponse.model_validate(task, from_attributes=True)


@router.put("/{task_id}",
           response_model=TaskResponse,
           summary="Update a task",
           description="Update an existing task's details. "
                      "Only the authenticated user who owns the task can update it.",
           responses={
               200: {"description": "Task updated successfully", "model": TaskResponse},
               401: {"description": "Unauthorized - Invalid or expired token"},
               404: {"description": "Task not found"},
               422: {"description": "Validation error - Invalid input data"}
           })
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep
):
    """
    Update a specific task by ID for the authenticated user

    Args:
        task_id: UUID of the task to update
        task_data: Updated task data (all fields are optional)
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation

    Returns:
        TaskResponse: The updated task details

    Raises:
        TaskNotFoundException: If the task doesn't exist or doesn't belong to the user
    """
    statement = select(Task).where(Task.id == task_id, Task.user_email == current_user)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFoundException(detail=f"Task with id {task_id} not found")

    # Update only the fields that were provided
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # Update the updated_at timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskResponse.model_validate(task, from_attributes=True)


@router.delete("/{task_id}",
               summary="Delete a task",
               description="Permanently delete a task. "
                          "Only the authenticated user who owns "
                          "the task can delete it.",
               responses={
                   200: {"description": "Task deleted successfully"},
                   401: {"description": "Unauthorized - Invalid or expired token"},
                   404: {"description": "Task not found"}
               })
async def delete_task(
    task_id: UUID,
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep
):
    """
    Delete a specific task by ID for the authenticated user

    Args:
        task_id: UUID of the task to delete
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation

    Returns:
        dict: Success message confirming deletion

    Raises:
        TaskNotFoundException: If the task doesn't exist or doesn't belong to the user
    """
    statement = select(Task).where(Task.id == task_id, Task.user_email == current_user)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFoundException(detail=f"Task with id {task_id} not found")

    await session.delete(task)
    await session.commit()

    return {"success": True, "message": "Task deleted successfully"}


@router.patch("/{task_id}/complete",
              response_model=TaskResponse,
              summary="Toggle task completion",
              description="Toggle the completion status of a task. "
                         "Updates the completed_at timestamp accordingly.",
              responses={
                  200: {
                      "description": "Task completion status toggled successfully",
                      "model": TaskResponse
                  },
                  401: {"description": "Unauthorized - Invalid or expired token"},
                  404: {"description": "Task not found"}
              })
async def toggle_task_completion(
    task_id: UUID,
    current_user: str = current_user_dep,
    session: AsyncSession = session_dep
):
    """
    Toggle the completion status of a task

    Args:
        task_id: UUID of the task to toggle
        current_user: Email of the authenticated user (extracted from JWT)
        session: Database session for the operation

    Returns:
        TaskResponse: The task with updated completion status

    Raises:
        TaskNotFoundException: If the task doesn't exist or doesn't belong to the user
    """
    statement = select(Task).where(Task.id == task_id, Task.user_email == current_user)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFoundException(detail=f"Task with id {task_id} not found")

    # Toggle completion status
    task.is_completed = not task.is_completed

    # Set completed_at timestamp if marking as completed, clear if marking as incomplete
    if task.is_completed:
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None

    # Update the updated_at timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return TaskResponse.model_validate(task, from_attributes=True)
