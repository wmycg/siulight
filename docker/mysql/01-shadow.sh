#!/bin/sh
set -eu
# Only the project-local MySQL container uses this shadow database for migrate dev.
case "$MYSQL_DATABASE:$MYSQL_USER" in
  *[!a-zA-Z0-9_:]*) echo 'MYSQL_DATABASE and MYSQL_USER must use letters, digits or underscores.' >&2; exit 1 ;;
esac
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}_shadow\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}_shadow\`.* TO '$MYSQL_USER'@'%';
SQL
