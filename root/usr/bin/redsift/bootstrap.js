/*jslint node: true */
"use strict";

// Provides bootstrapping for the to be launched nodes
const Nano = require('nanomsg');

const pair = Nano.socket('pair', OPTIONS);

console.log('Hello World');