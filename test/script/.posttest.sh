# set -x

export USER_ID="$(id -u)" \
    GROUP_ID="$(id -g)"

(set -x
    docker compose stop --timeout=1)