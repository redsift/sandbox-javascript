FROM ubuntu:15.04
MAINTAINER Rahul Powar email: rahul@redsift.io version: 1.1.101

# setup specifies the apt-get version, e.g. setup_0.12, setup_4.x, setup_5.x
ARG setup=setup_4.x

# Ecmascript version
ARG esv=es6

ENV SETUP_URL=https://deb.nodesource.com/${setup} ES_V=${esv}

ENV SIFT_ROOT="/run/dagger/sift" IPC_ROOT="/run/dagger/ipc"

# Fix for ubuntu to ensure /etc/default/locale is present
RUN update-locale

# Install nodejs and a minimal git + python + build tools as npm and node-gyp often needs it for modules
RUN export DEBIAN_FRONTEND=noninteractive && \
	echo Using NodeJS from $SETUP_URL && \
    apt-get update && \
    apt-get install -y curl && \
	curl -sL $SETUP_URL | bash - && \
	apt-get install -y nodejs \
		build-essential git \
		libpython-stdlib libpython2.7-minimal libpython2.7-stdlib mime-support python python-minimal python2.7 python2.7-minimal python-pip && \
	apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy support files across
COPY root /

# Install any required NPM modules
RUN cd /usr/bin/redsift && npm install && npm run $ES_V && rm -Rf node_modules/babel-cli node_modules/babel-preset-es2015 node_modules/jshint

VOLUME /run/dagger/sift

WORKDIR /run/dagger/sift

ENTRYPOINT [ "/usr/bin/nodejs", "/usr/bin/redsift/bootstrap.js" ]