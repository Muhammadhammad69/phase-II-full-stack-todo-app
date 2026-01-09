---
name: fastapi-async
description: Use async/await to handle concurrent requests efficiently. Understand when to use async functions and how they improve API performance. Use this skill when Claude needs to work with async/await patterns, concurrent request handling, performance optimization, or I/O-bound operations in FastAPI applications.
---

# Async/Await for Performance in FastAPI

## Overview
FastAPI is built on top of Starlette and supports both synchronous and asynchronous operations. Using async/await allows your application to handle multiple requests concurrently, which is especially beneficial for I/O-bound operations like database queries, HTTP requests, and file operations.

## Basic Async Functions

Define async route handlers using the `async` keyword:

```python
import asyncio
from fastapi import FastAPI

app = FastAPI()

@app.get("/async-endpoint")
async def async_endpoint():
    # Simulate async I/O operation
    await asyncio.sleep(1)
    return {"message": "Async operation completed"}

@app.get("/sync-endpoint")
def sync_endpoint():
    # Regular synchronous function
    import time
    time.sleep(1)
    return {"message": "Sync operation completed"}
```

## Async with I/O Operations

Use async functions for I/O-bound operations like file reading:

```python
import asyncio
from fastapi import FastAPI
from typing import List

app = FastAPI()

async def read_file_async(filename: str) -> str:
    """Simulate async file reading"""
    await asyncio.sleep(0.1)  # Simulate I/O delay
    return f"Content of {filename}"

@app.get("/files/{filename}")
async def read_file(filename: str):
    content = await read_file_async(filename)
    return {"filename": filename, "content": content}
```

## Async Dependencies

Create async dependencies for use with async route handlers:

```python
import asyncio
from fastapi import FastAPI, Depends

app = FastAPI()

async def get_current_user(token: str = None):
    if not token:
        return {"username": "anonymous", "id": 0}

    # Simulate async token validation
    await asyncio.sleep(0.05)
    return {"username": "john_doe", "id": 123}

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
```

## Concurrent Request Processing

Handle multiple concurrent requests efficiently:

```python
import asyncio
import aiohttp
from fastapi import FastAPI
from typing import List

app = FastAPI()

async def fetch_url(session: aiohttp.ClientSession, url: str) -> dict:
    """Fetch data from an external API"""
    async with session.get(url) as response:
        return await response.json()

@app.get("/aggregate-data")
async def aggregate_data():
    urls = [
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://jsonplaceholder.typicode.com/posts/2",
        "https://jsonplaceholder.typicode.com/posts/3"
    ]

    async with aiohttp.ClientSession() as session:
        # Execute all requests concurrently
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

    return {"results": results}
```

## Async Database Operations

Work with async database libraries:

```python
import asyncio
from fastapi import FastAPI
from typing import List, Optional

app = FastAPI()

# Simulate async database operations
class AsyncDatabase:
    def __init__(self):
        self.data = [
            {"id": 1, "name": "Item 1", "price": 10.99},
            {"id": 2, "name": "Item 2", "price": 20.99},
            {"id": 3, "name": "Item 3", "price": 30.99}
        ]

    async def get_all_items(self) -> List[dict]:
        await asyncio.sleep(0.01)  # Simulate async DB operation
        return self.data

    async def get_item_by_id(self, item_id: int) -> Optional[dict]:
        await asyncio.sleep(0.01)  # Simulate async DB operation
        for item in self.data:
            if item["id"] == item_id:
                return item
        return None

db = AsyncDatabase()

@app.get("/items/")
async def get_items():
    return await db.get_all_items()

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    item = await db.get_item_by_id(item_id)
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

## Async Background Tasks

Execute background tasks asynchronously:

```python
import asyncio
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

async def send_email_async(email: str, message: str):
    """Simulate async email sending"""
    await asyncio.sleep(2)  # Simulate email sending time
    print(f"Email sent to {email}: {message}")

@app.post("/send-email")
async def send_email(
    email: str,
    message: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email_async, email, message)
    return {"message": "Email queued for sending"}

# Alternative: Using async background tasks
from typing import Callable, Awaitable

async def async_background_task(func: Callable, *args):
    """Wrapper for async background tasks"""
    await func(*args)

@app.post("/send-email-async")
async def send_email_async_endpoint(
    email: str,
    message: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email_async, email, message)
    return {"message": "Async email queued for sending"}
```

## Async Generators and Streaming

Use async generators for streaming responses:

```python
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def generate_data_stream():
    """Generate data asynchronously for streaming"""
    for i in range(5):
        await asyncio.sleep(0.5)  # Simulate async data generation
        yield f"data: {i}\n\n"

@app.get("/stream-data")
async def stream_data():
    return StreamingResponse(generate_data_stream(), media_type="text/plain")
```

## Performance Comparison: Sync vs Async

Understand when to use async vs sync:

```python
import time
import asyncio
from fastapi import FastAPI

app = FastAPI()

# Synchronous approach - blocks the entire process
@app.get("/sync-operation")
def sync_operation():
    time.sleep(1)  # Blocks the entire process
    return {"result": "sync completed"}

# Asynchronous approach - allows other requests to be processed
@app.get("/async-operation")
async def async_operation():
    await asyncio.sleep(1)  # Allows other requests to be processed
    return {"result": "async completed"}

# Mixed approach - sync function called from async
@app.get("/mixed-operation")
async def mixed_operation():
    # This will block the event loop
    time.sleep(1)
    return {"result": "mixed completed"}

# Proper mixed approach - run sync in thread pool
@app.get("/proper-mixed-operation")
async def proper_mixed_operation():
    loop = asyncio.get_event_loop()
    # Run sync operation in a separate thread to avoid blocking
    result = await loop.run_in_executor(None, time.sleep, 1)
    return {"result": "proper mixed completed"}
```

## Async with Threading for CPU-Bound Tasks

Handle CPU-bound tasks in async context:

```python
import asyncio
from fastapi import FastAPI
import concurrent.futures
import time

app = FastAPI()

def cpu_intensive_task(n: int) -> int:
    """Simulate CPU-intensive task"""
    result = 0
    for i in range(n * 1000000):
        result += i
    return result

@app.get("/cpu-task-sync")
def cpu_task_sync(n: int = 100):
    """This will block the entire server"""
    result = cpu_intensive_task(n)
    return {"result": result, "method": "sync"}

@app.get("/cpu-task-async")
async def cpu_task_async(n: int = 100):
    """This runs CPU task in a thread pool to avoid blocking"""
    loop = asyncio.get_event_loop()

    # Run CPU-intensive task in a thread pool
    with concurrent.futures.ThreadPoolExecutor() as executor:
        result = await loop.run_in_executor(executor, cpu_intensive_task, n)

    return {"result": result, "method": "async_thread_pool"}

# For truly CPU-bound tasks, consider process pool
@app.get("/cpu-task-process")
async def cpu_task_process(n: int = 100):
    """For very CPU-intensive tasks, consider process pool"""
    loop = asyncio.get_event_loop()

    with concurrent.futures.ProcessPoolExecutor() as executor:
        result = await loop.run_in_executor(executor, cpu_intensive_task, n)

    return {"result": result, "method": "async_process_pool"}
```

## Async Error Handling

Handle errors in async functions properly:

```python
import asyncio
from fastapi import FastAPI, HTTPException

app = FastAPI()

async def risky_async_operation():
    await asyncio.sleep(0.1)
    # Simulate a potential error
    if True:  # Some condition that causes error
        raise ValueError("Something went wrong in async operation")

@app.get("/async-with-error")
async def async_with_error():
    try:
        result = await risky_async_operation()
        return {"result": result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
```

## Async Context Managers

Use async context managers for resource management:

```python
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

app = FastAPI()

class AsyncResource:
    def __init__(self, name: str):
        self.name = name
        self.is_open = False

    async def open(self):
        await asyncio.sleep(0.01)  # Simulate async setup
        self.is_open = True
        print(f"Resource {self.name} opened")
        return self

    async def close(self):
        await asyncio.sleep(0.01)  # Simulate async cleanup
        self.is_open = False
        print(f"Resource {self.name} closed")

    async def __aenter__(self):
        return await self.open()

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

@asynccontextmanager
async def get_async_resource(name: str):
    resource = AsyncResource(name)
    try:
        await resource.open()
        yield resource
    finally:
        await resource.close()

@app.get("/use-resource")
async def use_resource():
    # Method 1: Using the context manager
    async with AsyncResource("test_resource") as resource:
        # Use the resource
        await asyncio.sleep(0.01)
        return {"resource_name": resource.name, "is_open": resource.is_open}

@app.get("/use-resource-manager")
async def use_resource_manager():
    # Method 2: Using the context manager function
    async with get_async_resource("manager_resource") as resource:
        await asyncio.sleep(0.01)
        return {"resource_name": resource.name, "is_open": resource.is_open}
```

## Performance Monitoring with Async

Monitor async performance and concurrency:

```python
import asyncio
import time
from fastapi import FastAPI
from typing import Dict
import threading

app = FastAPI()

# Global state to track performance
class PerformanceTracker:
    def __init__(self):
        self.request_count = 0
        self.concurrent_requests = 0
        self.max_concurrent = 0
        self.lock = threading.Lock()

    def start_request(self):
        with self.lock:
            self.request_count += 1
            self.concurrent_requests += 1
            if self.concurrent_requests > self.max_concurrent:
                self.max_concurrent = self.concurrent_requests

    def end_request(self):
        with self.lock:
            self.concurrent_requests -= 1

tracker = PerformanceTracker()

@app.middleware("http")
async def performance_middleware(request, call_next):
    tracker.start_request()
    start_time = time.time()

    try:
        response = await call_next(request)
    finally:
        tracker.end_request()

    # Add performance headers
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/async-performance")
async def async_performance():
    # Simulate async work
    await asyncio.sleep(0.1)
    return {
        "request_count": tracker.request_count,
        "concurrent_requests": tracker.concurrent_requests,
        "max_concurrent": tracker.max_concurrent
    }
```

## Common Mistakes to Avoid

1. **Blocking Async Operations**: Don't call synchronous blocking functions from async functions
2. **Not Using Thread Pool for CPU-bound Tasks**: Use `run_in_executor` for CPU-bound operations
3. **Mixing Sync and Async Inappropriately**: Be consistent with your async/sync approach
4. **Forgetting `await`**: Always use `await` when calling async functions
5. **Not Handling Async Context Properly**: Use async context managers for resource management
6. **Assuming Async Always Faster**: Async is beneficial for I/O-bound operations, not CPU-bound

## When to Use Async

### Use Async When:
- Making HTTP requests to external APIs
- Reading/writing files
- Database queries
- Working with external services
- Any operation that involves I/O

### Use Sync When:
- Pure computation
- Operations that don't involve I/O
- When working with libraries that don't support async
- Simple operations that complete quickly

## Real-World Use Cases

### Async API Gateway
```python
import asyncio
import aiohttp
from fastapi import FastAPI
from typing import List, Dict

app = FastAPI()

class AsyncAPIClient:
    def __init__(self):
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_from_service(self, service_url: str) -> Dict:
        async with self.session.get(service_url) as response:
            return await response.json()

@app.get("/aggregate-services")
async def aggregate_services():
    service_urls = [
        "https://jsonplaceholder.typicode.com/users",
        "https://jsonplaceholder.typicode.com/posts",
        "https://jsonplaceholder.typicode.com/todos"
    ]

    async with AsyncAPIClient() as client:
        tasks = [
            client.fetch_from_service(url) for url in service_urls
        ]
        results = await asyncio.gather(*tasks)

    return {
        "users": results[0][:5],  # Limit to first 5 users
        "posts": len(results[1]),  # Count of posts
        "todos": len(results[2])   # Count of todos
    }
```

### Async Task Queue
```python
import asyncio
from fastapi import FastAPI, BackgroundTasks
from typing import List, Dict
import uuid

app = FastAPI()

class AsyncTaskQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.results = {}

    async def add_task(self, task_id: str, task_func, *args):
        self.results[task_id] = None
        await self.queue.put((task_id, task_func, args))

    async def process_tasks(self):
        while True:
            task_id, task_func, args = await self.queue.get()
            try:
                result = await task_func(*args) if asyncio.iscoroutinefunction(task_func) else task_func(*args)
                self.results[task_id] = {"status": "completed", "result": result}
            except Exception as e:
                self.results[task_id] = {"status": "failed", "error": str(e)}
            finally:
                self.queue.task_done()

# Start background task processor
task_queue = AsyncTaskQueue()
asyncio.create_task(task_queue.process_tasks())

async def simulate_long_running_task(duration: int):
    await asyncio.sleep(duration)
    return f"Task completed after {duration} seconds"

@app.post("/tasks/submit")
async def submit_task(duration: int = 2):
    task_id = str(uuid.uuid4())
    await task_queue.add_task(task_id, simulate_long_running_task, duration)
    return {"task_id": task_id, "message": "Task submitted"}

@app.get("/tasks/{task_id}")
async def get_task_result(task_id: str):
    if task_id not in task_queue.results:
        return {"status": "pending", "result": None}

    result = task_queue.results[task_id]
    return result
```

## Quick Reference

- **Async function**: `async def function_name():`
- **Await keyword**: `await async_function()`
- **Async dependency**: `async def dependency():`
- **Run sync in thread**: `await loop.run_in_executor(None, sync_func, args)`
- **Concurrent execution**: `await asyncio.gather(*tasks)`
- **Background tasks**: `background_tasks.add_task(func, *args)`
- **Async context manager**: `async with resource:`
- **Async generator**: `async def generate(): yield value`

## Performance Best Practices

1. **Use async for I/O-bound operations** - database queries, HTTP requests, file operations
2. **Use thread pools for CPU-bound tasks** - run with `run_in_executor`
3. **Avoid blocking calls** in async functions
4. **Use asyncio.gather** for concurrent operations
5. **Monitor concurrent request count** to optimize performance
6. **Test performance** with tools like `wrk` or `ab` to measure concurrent request handling