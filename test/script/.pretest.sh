export USER_ID="$(id -u)" \
    GROUP_ID="$(id -g)"

cd test

(set -x
    docker compose up --detach)

container="$(docker compose ps '--format={{.Name}}' 2>/dev/null)"

if ! test -d ../node_modules; then
    (set -x
        docker exec --interactive --workdir=/pkg "${container}" npm ci --no-update-notifier --no-audit --no-fund)
fi

if ! test -d project/node_modules; then
    (set -x
        docker exec --interactive "${container}" npm ci --no-update-notifier --no-audit --no-fund)
fi

container_port="$(
    docker port "${container}" \
        | grep '0.0.0.0' \
        | sed -E 's/5173\/tcp -> 0.0.0.0:([0-9]+)$/\1/')"
printf 1>project/node_modules/.port '%s' "${container_port}"