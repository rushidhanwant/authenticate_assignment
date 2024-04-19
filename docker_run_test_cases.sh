set -e

# Env
server_image_name=${1:-"hapi-core"}
database_image_name=${2:-"postgres"}
database_name="hapi_core"

server_container_name="hapi_core_test"
database_container_name="hapi_core_db"
network_name="hapi_core_network"

echo "Clearing old containers if any"
if [ "$(docker container ls -a | grep $server_container_name)" ]; then
    docker rm -f $server_container_name || true
fi
if [ "$(docker container ls -a | grep $database_container_name)" ]; then
    docker rm -f $database_container_name || true
fi
if [ "$(docker network ls | grep $network_name)" ]; then
    docker network rm $network_name || true
fi

echo "Creating docker network"
docker network create $network_name

echo "Creating Test postgres"
docker run --name $database_container_name --net $network_name --tmpfs=/pgtmpfs -e PGDATA=/pgtmpfs -e POSTGRES_HOST_AUTH_METHOD=trust -d $database_image_name

until (docker exec $database_container_name psql -h localhost -d postgres -U postgres)
do
  echo "waiting for postgres container..."
  sleep 0.5
done
echo "postgres container started"

echo "Creating database"
docker exec $database_container_name createdb -U postgres $database_name

echo "Running Test cases"

if docker run --rm --name $server_container_name --net $network_name --link $database_container_name:postgres_container_db --env TEST_DB_CONNECTION_URI=postgres://postgres@postgres_container_db/hapi_core $server_image_name npm test; then
  echo "Test Success"
  echo "Cleaning up"
  docker rm -f $server_container_name
  docker rm -f $database_container_name
  docker network rm $network_name
  exit 0
else
  echo "Test Failure"
  docker rm -f $server_container_name
  docker rm -f $database_container_name
  docker network rm $network_name
  exit 1
fi



