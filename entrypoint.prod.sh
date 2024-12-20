#!/bin/bash

# Check if the database directory is empty
if [ -z "$(ls -A /usr/src/app/database/database.db 2>/dev/null)" ]; then
  echo "Database folder is empty. Initializing..."
  cp -r /usr/src/app/database-init/* /usr/src/app/database
else
  echo "Database folder already initialized."
fi

# Start the application
exec "$@"
