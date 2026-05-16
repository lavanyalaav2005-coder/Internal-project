#!/bin/bash
echo "🚀 Starting NexaERP Backend..."
cd "$(dirname "$0")"
python manage.py migrate --run-syncdb 2>/dev/null || true
python seed_data.py 2>/dev/null || true
echo "✅ Backend running at http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/api/"
echo "🔑 Admin: http://localhost:8000/admin/ (admin/admin123)"
python manage.py runserver 0.0.0.0:8000
