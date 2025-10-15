# mail/forwarder/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    requests \
    watchdog

# Copy forwarder script
COPY forwarder.py /app/

# Run the forwarder
CMD ["python", "-u", "forwarder.py"]
