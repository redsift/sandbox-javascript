# Sandbox for NodeJS
[![Docker Repository on Quay](https://quay.io/repository/redsift/sandbox-javascript/status "Docker Repository on Quay")](https://quay.io/repository/redsift/sandbox-javascript)

# Filesystem Layout and API

`SIFT_ROOT` Runs the sift made available in this path, defaults to `/run/sandbox/sift`
`IPC_ROOT` Uses Nanomsg req/rep sockets in this path, defaults to `/run/sandbox/ipc`. Node ordinality is used as the identity e.g. the 1st node in the DAG comunicates over `/run/sandbox/ipc/0.sock`

# Docker launch

`io.redsift.sandbox.install` CMD for one time install operations.
`io.redsift.sandbox.run` CMD for run operations.

Parameters are the node numbers you wish the script to install or execute.

# Running manually

	docker run -u 7438
		-v <path-to-sift>:/run/sandbox/sift
		-v <path-to-ipcs>:/run/sandbox/ipc
		quay.io/redsift/sandbox-javascript:v12.22.1
		/usr/bin/redsift/run.js
		0 1 2

`nn_req -X /run/sandbox/ipc/0.sock -D "{\"dummy\":1}" --raw`


# Running tests
 - `install capnproto 0.8.0 from source`
 ```
 curl -O https://capnproto.org/capnproto-c++-0.8.0.tar.gz
 tar zxf capnproto-c++-0.8.0.tar.gz
 cd capnproto-c++-0.8.0
 ./configure
 make -j6 check
 sudo make install
 ```
 - install node-capnp from git
 ```
 git clone --single-branch --branch patched https://github.com/capnproto/node-capnp.git
 cd node-capnp
 npm install
 ```
 - `npm install`
 - `npm test`

# Build docker
 - `docker build -t quay.io/redsift/sandbox-javascript:some-custom-tag .`
