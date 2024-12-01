#!/bin/sh
set -e

if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_PORT" ]; then
  >&2 echo "Error: POSTGRES_HOST or POSTGRES_PORT is not set"
  exit 1
fi

echo "Waiting for PostgreSQL to be ready at $POSTGRES_HOST:$POSTGRES_PORT..."
while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  >&2 echo "PostgreSQL is unavailable - retrying..."
  sleep 2
done

>&2 echo "PostgreSQL is ready! Running migrations..."
yarn run-migrations || (>&2 echo "Migration failed!" && exit 1)
>&2 echo "Migrations completed. Starting the application..."
yarn start
