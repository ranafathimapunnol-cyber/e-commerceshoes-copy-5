"""
Gunicorn configuration for production
Does NOT affect your development runserver
"""
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
timeout = 120
accesslog = "-"
errorlog = "-"
