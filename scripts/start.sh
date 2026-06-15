#!/bin/sh
set -e
cd /app
python -c "from data.quick_seed import seed_if_empty; n=seed_if_empty(); print(f'Seeded {n} demo companies' if n else 'Database already has data')"
exec uvicorn api.main:app --host 0.0.0.0 --port "${PORT:-8000}"
