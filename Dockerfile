FROM quay.io/redsift/sandbox:latest
MAINTAINER Rahul Powar email: rahul@redsift.io version: 1.1.101

# nodev specifies node version
ARG nodev=4.x

# Ecmascript version
ARG esv=es6

ENV NODE_VERSION=${nodev} SETUP_URL=https://deb.nodesource.com/setup_${nodev} ES_V=${esv}

# Set HOME temporarily to /root
ENV HOME /root

LABEL io.redsift.dagger.init="/usr/bin/redsift/install.js" io.redsift.dagger.run="/usr/bin/redsift/bootstrap.js"
LABEL io.redsift.sandbox.install="/usr/bin/redsift/install.js" io.redsift.sandbox.run="/usr/bin/redsift/bootstrap.js"

# Copy support files across
COPY root /

# Install nodejs and a minimal git + python + build tools as npm and node-gyp often needs it for modules
RUN export DEBIAN_FRONTEND=noninteractive && \
		/usr/bin/redsift/setup-nodejs && \
	  apt-get install -y build-essential git \
  		libpython-stdlib libpython2.7-minimal libpython2.7-stdlib mime-support python python-minimal python2.7 python2.7-minimal python-pip && \
  	apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install any required NPM modules
RUN cd /usr/bin/redsift && \
  npm install && npm install nanomsg --use_system_libnanomsg=true && \
	npm run $ES_V && rm -Rf node_modules/babel-cli node_modules/babel-preset-es2015 node_modules/jshint

# Set HOME back to /home/sandbox
ENV HOME /home/sandbox

ENTRYPOINT [ "node" ]
