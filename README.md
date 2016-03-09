# Sandbox for NodeJS
[![Docker Repository on Quay](https://quay.io/repository/redsift/sandbox-javascript/status "Docker Repository on Quay")](https://quay.io/repository/redsift/sandbox-javascript)

# Filesystem Layout and API

`SIFT_ROOT` Runs the sift made available in this path, defaults to `/run/dagger/sift`
`IPC_ROOT` Uses Nanomsg req/rep sockets in this path, defaults to `/run/dagger/ipc`. Node ordinality is used as the identity e.g. the 1st node in the DAG comunicates over `/run/dagger/ipc/0.sock`

# Docker launch

`io.redsift.dagger.init` CMD for one time init operations.
`io.redsift.dagger.run` CMD for run operations.

Parameters are the node numbers you wish the bootstrap to init or execute.

# Running manually

	docker run 
		-v <path-to-sift>:/run/dagger/sift 
		-v <path-to-ipcs>:/run/dagger/ipc 
		quay.io/redsift/sandbox-javascript:v4.2.2
		/usr/bin/redsift/bootstrap.js
		0 1 2

`nn_req -X /run/dagger/ipc/0.sock -D "{\"dummy\":1}" --raw`
