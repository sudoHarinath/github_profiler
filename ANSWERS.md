### `ANSWERS.md`

```markdown
# Technical Assessment Insights — Repository QA

## 1. How to run
Execute the following step-by-step commands on a fresh terminal environment:
```bash
pip install -r requirements.txt
export GITHUB_PAT="your_github_token_here"
uvicorn app.main:app --reload
Once initialized, launch your web browser and navigate directly to: http://127.0.0.1:8000

2. Stack choice
I selected FastAPI (Python) for this system due to its structural and operational advantages within microservice-oriented proxy applications:

Zero Compilation Overhead: Unlike TypeScript/Node frameworks which require build setups (tsc, ts-node, bundlers), Python acts as an interpreted layer. This eliminates version execution traps and guarantees smooth compilation on a reviewer’s machine.

Parallel Performance: FastAPI’s async native engine handles independent asynchronous networking contexts flawlessly.

Data Agility: Python provides exceptionally clean manipulation paradigms (list comprehensions, dictionary folding) to transform deeply nested upstream payloads into normalized metrics.

A significantly worse choice for this specific application would have been a heavy, opinionated framework like Django or Spring Boot. These monolithic frameworks are built around a database ORM. Because our platform is completely stateless, uses an in-memory cache, and acts purely as an analytical aggregator for an external downstream API, fighting Django’s default database setup requirements would introduce unnecessary bloat, configuration boilerplate, and high startup latency.

3. One real edge case
Our code successfully mitigates the critical edge case of Upstream API Rate-Limit Exhaustion & Latency Thrashing through On-Demand Lazy Loading.

The File & Lines: Handled in app/main.py (Lines 29–51) and bound to UI expansion interactions inside static/app.js (Lines 111–137).

The Mechanism: To evaluate a candidate's projects deeply, technical recruiters need context from repository documentation. However, requesting the README.md files for 30+ repositories during the initial search profile fetch would trigger massive network lag and instantly exhaust GitHub API rate credits.

Without this Handling: The application would freeze on every search query, and a single user running multiple profiles would get banned by GitHub's rate limiter within minutes. Our solution loads basic repository listings instantly, and only executes network queries for documentation snippets if a user explicitly clicks to expand that specific repository row context.

4. AI usage
I utilized an AI assistant as an architectural sparring partner across the following developmental cycles:

Asynchronous Orchestration Design: Asked how to efficiently call multiple remote endpoints simultaneously. The AI initially suggested using an experimental httpx.Client.get_all pattern. During strict execution, this threw an AttributeError. I actively overrode this advice, replacing it with Python's stable asyncio.gather loop tasks.

Interface Synchronization Debugging: When integrating the lazy-loaded README route, the frontend threw a persistent 404 Not Found failure error. I consulted the AI with terminal logs, which helped spot a path string mismatch. The backend expected /api/repo/{username}/{repo_name}/readme but the frontend was fetching /api/repo/{username}/{repo_name}. I corrected app/main.py to decouple the trailing string wrapper, cleanly synchronizing the routing layer.

5. Honest gap
Our current local storage mechanism (app/cache.py) utilizes a localized, in-memory Python dictionary class instance to handle Time-To-Live (TTL) cache values. While this provides extremely fast sub-millisecond response loops, it presents an honest production gap: Uncapped Memory Drift.

Because the internal cache collection does not utilize an active, background worker thread or garbage collection sweep loop, expired cache entries are only pruned if a user explicitly queries that exact same username key again. In a high-traffic production scenario with thousands of unique searches, this memory footprint would expand indefinitely. Given an extra day, I would replace this baseline storage dictionary with an isolated, size-bounded LRU (Least Recently Used) Cache or integrate an asynchronous background sweep worker to guarantee a strict, unbreachable memory cap.
