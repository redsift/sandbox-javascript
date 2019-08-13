FROM quay.io/redsift/sandbox:latest
MAINTAINER Rahul Powar email: rahul@redsift.io version: 1.1.101

# nodev specifies node version
ARG nodev=8.10.0
LABEL io.redsift.sandbox.install="/usr/bin/redsift/install.js" io.redsift.sandbox.run="/usr/bin/redsift/run.js"

# Copy support files across
COPY root /

ENV NVM_VERSION 0.34.0
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION=${nodev}

# Install a minimal git + python + build tools as npm and node-gyp often needs it for modules
RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get install -y build-essential git \
    libpython-stdlib libpython2.7-minimal libpython2.7-stdlib mime-support python python-minimal python2.7 python2.7-minimal python-pip && \
    apt-get purge -y && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash \
		&& . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Version dump
RUN \
	echo "NodeJS" `node -v` && \
	echo "NPM" `npm -v`

# Install any required NPM modules
RUN cd /usr/bin/redsift && \
    npm install && npm install nanomsg@4.0.2 && \
    npm run es6 && rm -Rf node_modules/\@babel/* node_modules/jshint

RUN chown -R sandbox:sandbox $HOME

ENTRYPOINT [ "node" ]
