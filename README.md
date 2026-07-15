# Planr

A full-stack planner application built to demonstrate real-world usage of **data structures & algorithms**, **backend design**, and **frontend architecture patterns** — not toy examples, but DSA powering actual features.

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## What Makes This Project Interesting

Most portfolio projects use frameworks to abstract everything away. This one deliberately implements key algorithms **from scratch** and uses them in production code paths:

| Feature | Algorithm | Why Not Just Use a Library? |
|---|---|---|
| Task sorting by priority | Custom **min-heap** with sift-up/sift-down | To demonstrate O(n log n) heap sort internals, FIFO tiebreaking, and when you'd choose a heap over `.sort()` |
| Task dependency management | **Directed graph** with DFS cycle detection | To show real-world DAG modeling — the same pattern behind build systems, package managers, and CI pipelines |
| Execution order | **Kahn's algorithm** (topological sort) | To demonstrate BFS-based ordering on a DAG, explain in-degree tracking, and compare to DFS-based alternatives |

---

## Tech Stack

```
Frontend                          Backend
├── React 18 + TypeScript         ├── Python + FastAPI
├── Vite (dev server + build)     ├── SQLAlchemy ORM
├── Zustand (state management)    ├── SQLite (dev) / PostgreSQL (prod)
├── Axios (HTTP client)           └── Pydantic (validation)
└── Tailwind CSS (styling)
```

---

## Project Structure

```
planr/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, lifespan
│   │   ├── config.py                # Settings via pydantic-settings
│   │   ├── database.py              # SQLAlchemy engine + session
│   │   ├── dsa/
│   │   │   ├── priority_queue.py    # ⭐ Custom min-heap (from scratch)
│   │   │   └── dependency_graph.py  # ⭐ DAG + topological sort (from scratch)
│   │   ├── models/
│   │   │   ├── task.py              # Task SQLAlchemy model
│   │   │   └── dependency.py        # TaskDependency model
│   │   ├── schemas/
│   │   │   └── task.py              # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── tasks.py             # Task CRUD endpoints
│   │   │   └── dependencies.py      # Dependency endpoints
│   │   └── services/
│   │       └── task_service.py      # Business logic (uses DSA modules)
│   └── tests/
│       ├── test_priority_queue.py   # 8 unit tests
│       └── test_dependency_graph.py # 10 unit tests
│
├── src/
│   ├── api/
│   │   ├── client.ts                # Axios instance
│   │   └── taskApi.ts               # All API call functions
│   ├── hooks/
│   │   ├── useTasks.ts              # CRUD + toggle for daily tasks
│   │   ├── useMonthTasks.ts         # Calendar summary data
│   │   └── useTaskDependencies.ts   # Dependency management
│   ├── store/
│   │   └── taskStore.ts             # Zustand store (selected date, refresh)
│   ├── types/
│   │   └── task.ts                  # TypeScript interfaces
│   └── components/
│       ├── Background.tsx           # Cursor-tracked gradient background
│       ├── Navbar.tsx               # Navigation (Calendar / Pomodoro)
│       ├── Calendar.tsx             # Month/year selector
│       ├── MonthGrid.tsx            # 7-column day grid
│       ├── DayCell.tsx              # Day square with GitHub-style indicators
│       ├── DailyView.tsx            # Selected day's task list
│       ├── Pomodoro.tsx             # 25/5 Pomodoro timer + today's tasks
│       ├── daily/
│       │   ├── TaskForm.tsx         # Add/edit form with time + priority
│       │   └── TaskItem.tsx         # Task row with actions
│       ├── dependencies/
│       │   └── DependencyModal.tsx  # Add/remove dependency UI
│       └── shared/
│           └── PriorityBadge.tsx    # Color-coded P1–P5 badge
```

---

## DSA Deep Dive

### 1. Min-Heap Priority Queue

**File:** `backend/app/dsa/priority_queue.py`

Used by `GET /api/tasks?date=` — when you fetch tasks for a day, they're pushed into the heap by priority and drained out in order. Priority 1 (urgent) surfaces first.

```
         (1, 0, "Deploy fix")           ← root = highest priority
        /                    \
(3, 1, "Write tests")    (2, 2, "Review PR")
```

**Key implementation details:**
- **Array-backed binary heap** — parent at `i`, children at `2i+1` and `2i+2`
- **Tuple comparison** `(priority, counter, item)` — the counter breaks ties so equal-priority tasks maintain insertion order (FIFO stability)
- **`_sift_up`** — after `push`, bubble the new element up by swapping with its parent until the heap property holds
- **`_sift_down`** — after `pop`, move the replacement root down by swapping with the smaller child
- **`drain`** — repeatedly `pop` to produce a fully sorted list in O(n log n)

**Complexity:**
| Operation | Time |
|-----------|------|
| `push` | O(log n) |
| `pop` | O(log n) |
| `peek` | O(1) |
| `drain` | O(n log n) |

**Interview talking point:** "I could have used Python's `heapq`, but implementing it from scratch let me handle the FIFO tiebreaker cleanly and demonstrates I understand the underlying mechanics — not just the API."

### 2. Directed Graph + Topological Sort

**File:** `backend/app/dsa/dependency_graph.py`

Used by the dependency system — when you say "Task A depends on Task B", an edge is added to a directed graph. Before adding, DFS checks for cycles. When you request execution order, Kahn's algorithm produces a topological sort.

```
   [Write tests] ──depends on──→ [Set up CI]
         │                            │
         └──depends on──→ [Write code] ←──depends on──┘

   Execution order: Write code → Set up CI → Write tests
```

**Key implementation details:**
- **Adjacency list** — `dict[int, set[int]]` mapping each task to its dependencies
- **Cycle detection (DFS)** — before adding edge A→B, run DFS from B: if it can reach A through existing edges, adding A→B would create a cycle → reject
- **Kahn's algorithm** — compute in-degrees, start with zero-dependency nodes, process layer by layer using a queue. If not all nodes are processed, a cycle exists

**Interview talking point:** "This is the same pattern used by Make, Webpack, npm, and CI/CD systems. I chose Kahn's over DFS-based topological sort because it naturally detects cycles (incomplete result) and processes nodes in BFS layers, which maps well to task scheduling."

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks?date=YYYY-MM-DD` | Tasks for a date, **heap-sorted by priority** |
| `GET` | `/api/tasks/month?year=Y&month=M` | Task counts per day (calendar summary) |
| `GET` | `/api/tasks/order?date=YYYY-MM-DD` | **Topologically-sorted** execution order |
| `GET` | `/api/tasks/{id}` | Single task with dependency info |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task (cascades dependencies) |
| `POST` | `/api/tasks/{id}/dependencies` | Add dependency (**with cycle check**) |
| `DELETE` | `/api/tasks/{id}/dependencies/{dep_id}` | Remove dependency |

Interactive docs available at `/docs` (Swagger UI) and `/redoc`.

---

## Architecture Decisions

### Backend: Layered Architecture

```
Request → Router → Service → DSA Module
                      ↓
                   Database
```

- **Routers** handle HTTP concerns (status codes, validation, serialization)
- **Services** contain business logic and orchestrate DSA modules
- **DSA modules** are pure, stateless, and independently testable — no database knowledge

*Why this matters:* The priority queue and dependency graph have zero coupling to FastAPI or SQLAlchemy. You can import them in a REPL, test them in isolation, or swap them into a different framework.

### Frontend: Custom Hooks Pattern

```
Component (UI only)
    ↓ calls
Custom Hook (data + logic)
    ↓ calls
API Module (HTTP)
    ↓ calls
Backend
```

- **Components** are purely presentational — they receive data and callbacks
- **Hooks** (`useTasks`, `useMonthTasks`) encapsulate all fetching, caching, and mutation logic
- **API module** contains raw HTTP calls via Axios

*Why this matters:* "I can swap REST for GraphQL by changing only the API module and hooks — zero component changes."

### State Management: Zustand

A single store holds `selectedDate`, `selectedMonth`, `selectedYear`, and a `refreshKey`. When the daily view creates/deletes/updates a task, it increments `refreshKey`, which triggers the calendar's month summary to re-fetch. This keeps the two views in sync without prop drilling or context overhead.

---

## Design

- **Cursor-tracked gradient** — the background radial gradient follows your mouse position in real-time using CSS custom properties set via a `mousemove` listener
- **Glass morphism** — cards use `backdrop-blur` + semi-transparent white for a frosted glass effect
- **Animated blobs** — three large blurred circles float behind content with staggered CSS animations
- **GitHub-style squares** — calendar days show task completion as small rounded squares (green = done, grey = pending), inspired by GitHub's contribution graph
- **Pink accent system** — selected states, active nav, focus rings, and CTA buttons use a consistent pink palette

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the server (creates SQLite DB automatically)
uvicorn app.main:app --reload
```

The API is now running at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
# From the project root
npm install
npm run dev
```

The app is now running at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

### Run Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

```
tests/test_priority_queue.py::test_push_and_pop_single      PASSED
tests/test_priority_queue.py::test_priority_ordering         PASSED
tests/test_priority_queue.py::test_fifo_tiebreaker           PASSED
tests/test_priority_queue.py::test_drain                     PASSED
tests/test_priority_queue.py::test_peek                      PASSED
tests/test_priority_queue.py::test_pop_empty_raises          PASSED
tests/test_priority_queue.py::test_len_and_bool              PASSED
tests/test_priority_queue.py::test_large_input               PASSED
tests/test_dependency_graph.py::test_add_edge_and_has_edge   PASSED
tests/test_dependency_graph.py::test_cycle_detection_*       PASSED (x3)
tests/test_dependency_graph.py::test_no_false_cycle          PASSED
tests/test_dependency_graph.py::test_topological_sort_*      PASSED (x4)
tests/test_dependency_graph.py::test_remove_edge             PASSED

18 passed
```

---

## Database Schema

```sql
tasks (
    id            INTEGER PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    date          DATE NOT NULL,          -- indexed for fast daily lookups
    time          VARCHAR(5),             -- "HH:MM" format, nullable
    priority      INTEGER DEFAULT 3,      -- 1 (highest) to 5 (lowest)
    is_completed  BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
)

task_dependencies (
    id            INTEGER PRIMARY KEY,
    task_id       INTEGER → tasks.id ON DELETE CASCADE,
    depends_on_id INTEGER → tasks.id ON DELETE CASCADE,
    UNIQUE(task_id, depends_on_id),
    CHECK(task_id != depends_on_id)       -- prevent self-loops
)
```

---

## Switching to PostgreSQL

1. Install the driver: `pip install "psycopg[binary]"`
2. Create a `.env` file in `backend/`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/planr
   ```
3. Restart the server — tables are created automatically on startup
