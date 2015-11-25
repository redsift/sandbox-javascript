# Sandbox for NodeJS

[![Docker Repository on Quay](https://quay.io/repository/redsift/sandbox-nodejs/status "Docker Repository on Quay")](https://quay.io/repository/redsift/sandbox-nodejs)

# Filesystem Layout and API

Runs the sift made available in `/run/dagger/sift`

Uses Nanomsg req/rep sockes in `/run/dagger/ipc`. Node ordinality is used as the identity e.g. the 1st node in the DAG comunicates over `/run/dagger/ipc/0.sock`

Parameters are the node numbers you wish the bootstrap to execute.

# Running manually

`docker run -v <path-to-sift>:/run/dagger/sift -v <path-to-ipcs>:/run/dagger/ipc quay.io/redsift/sandbox-nodejs:v4.2.2 0 1 2`

`nn_req -X /run/dagger/ipc/0.sock -D "{\"dummy\":1}" --raw`
