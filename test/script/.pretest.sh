export USER_ID="$(id -u)" \
    GROUP_ID="$(id -g)"

(set -x
    docker compose up --detach)

container='vite-ssg-react-dev-server-1'

if ! test -d node_modules; then
    (set -x
        docker exec --interactive --workdir=/pkg "${container}" npm ci --no-update-notifier --no-audit --no-fund)
fi

if ! test -d test/project/node_modules; then
    (set -x
        docker exec --interactive "${container}" npm ci --no-update-notifier --no-audit --no-fund)
fi

container_port="$(
    docker port "${container}" \
        | grep '0.0.0.0' \
        | sed -E 's/5173\/tcp -> 0.0.0.0:([0-9]+)$/\1/')"
printf 1>test/project/node_modules/.port '%s' "${container_port}"