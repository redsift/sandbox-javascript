FROM quay.io/redsift/sandbox:22.04-beta
LABEL author.name="Karl Norling" \
  author.email="karl.norling@redsift.io" \
  version="1.1.102" \
  organization="Red Sift"

# nodev specifies node version
ARG nodev=18.17.1
LABEL io.redsift.sandbox.install="/usr/bin/redsift/install.js" io.redsift.sandbox.run="/usr/bin/redsift/run.js"

ENV NVM_VERSION 0.39.5
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION=${nodev}
ENV NPM_VERSION=9.6.7

# Install a minimal git + python + build tools as npm and node-gyp often needs it for modules
RUN export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y build-essential git dnsutils \
  libpython3-stdlib mime-support python3-minimal python3 python3-pip && \
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

# Install any required NPM modules (unsafe-perm: to allow for cloning)
# npm ci is faster than npm install, but requires lock file
RUN cd /usr/bin/redsift && \
  npm ci --unsafe-perm && \ 
  npm run es6 && rm -Rf node_modules/jshint


RUN chown -R sandbox:sandbox $HOME

ENTRYPOINT [ "node" ]
