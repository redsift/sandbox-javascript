FROM ubuntu:15.04
MAINTAINER Rahul Powar email: rahul@redsift.io version: 1.1.101

# setup specifies the apt-get version, e.g. setup_0.12, setup_4.x, setup_5.x
ARG setup
ENV SETUP_URL https://deb.nodesource.com/${setup:-setup_4.x}

# Fix for ubuntu to ensure /etc/default/locale is present
RUN update-locale

# Define working directory.
WORKDIR /tmp

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

RUN cd /usr/bin/redsift && npm install

ENTRYPOINT [ "/usr/bin/nodejs" ]