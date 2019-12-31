FROM quay.io/redsift/sandbox:18.04-beta
LABEL author.name="Karl Norling" \
  author.email="karl.norling@redsift.io" \
  version="1.1.101" \
  organization="Red Sift"

# nodev specifies node version
ARG nodev=8.10.0
LABEL io.redsift.sandbox.install="/usr/bin/redsift/install.js" io.redsift.sandbox.run="/usr/bin/redsift/run.js"

ENV NVM_VERSION 0.35.2
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION=${nodev}
ENV NPM_VERSION=6.13.4

# Install a minimal git + python + build tools as npm and node-gyp often needs it for modules
RUN export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y build-essential git libcapnp-dev capnproto \
  libpython-stdlib libpython2.7-minimal libpython2.7-stdlib mime-support python python-minimal python2.7 python2.7-minimal python-pip && \
  apt-get purge -y && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nvm with node and npm
RUN mkdir -p $NVM_DIR && curl https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default \
  && npm i -g npm@${NPM_VERSION} \
  && npm_config_user=root

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Version dump
RUN \
  echo "NodeJS" `node -v` && \
  echo "NPM" `npm -v`

# Copy support files across
COPY root /

# Build node-capnp
RUN /usr/bin/install_capnp

# Install any required NPM modules
RUN cd /usr/bin/redsift && \
  npm install && \
  npm run es6 && rm -Rf node_modules/\@babel/* node_modules/jshint


RUN chown -R sandbox:sandbox $HOME

ENTRYPOINT [ "node" ]