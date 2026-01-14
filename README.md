# Todo Full-Stack Web Application

This project implements a comprehensive todo application with both frontend and backend components, following modern development practices and using cutting-edge technologies.

## Project Structure

```
todo-fullstack/
├── backend/              # FastAPI backend with SQLModel and NeonDB
├── frontend/             # Next.js frontend application
├── specs/                # Specification documents
├── history/              # Prompt history records and ADRs
└── .specify/             # SpecKit Plus configuration
```

## Backend Overview

The backend is built with FastAPI and provides a robust API for managing todo tasks:

- **Framework**: FastAPI for high-performance async web API
- **Database**: SQLModel with NeonDB (serverless PostgreSQL)
- **Authentication**: JWT-based authentication
- **Features**:
  - Create, read, update, and delete tasks
  - Task filtering and pagination
  - Priority levels (low, medium, high)
  - Completion tracking with timestamps
  - User-based task ownership

### Backend Setup

For detailed backend setup instructions, see [backend/README.md](./backend/README.md).

### Running the Backend

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv sync --all-extras
uv run dev
```

The backend will be available at `http://localhost:8000`.

## Frontend Overview

The frontend is built with Next.js and provides a responsive user interface:

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS for modern, responsive design
- **Type Safety**: Full TypeScript support
- **Features**:
  - Task creation and management
  - Real-time updates
  - Filtering and sorting capabilities
  - Responsive design for all devices

### Frontend Setup

For detailed frontend setup instructions, see [frontend/README.md](./frontend/README.md).

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Development Workflow

This project follows the Spec-Driven Development (SDD) methodology:

1. Specifications are defined in the `specs/` directory
2. Implementation follows the defined tasks and requirements
3. Prompt History Records (PHRs) are maintained in `history/prompts/`
4. Architectural Decision Records (ADRs) are documented in `history/adr/`

## Technologies Used

### Backend
- **Python 3.13+**: Language for backend development
- **FastAPI**: Modern, fast web framework
- **SQLModel**: SQL toolkit and ORM combining SQLAlchemy and Pydantic
- **NeonDB**: Serverless PostgreSQL for easy scaling
- **JWT**: Authentication and authorization
- **Pydantic**: Data validation and settings management

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form management
- **Axios/Fetch**: API communication

### Development Tools
- **UV**: Fast Python package installer and resolver
- **Ruff**: Extremely fast Python linter and formatter
- **pytest**: Testing framework
- **httpx**: HTTP client for testing

## Contributing

1. Review the specifications in the `specs/` directory
2. Follow the established project structure
3. Maintain consistent coding standards
4. Write tests for new functionality
5. Update documentation as needed

## License

This project is licensed under the terms defined in the project's license file.