const adapter = require('./adapter.js');
const Ruuvi = require('./ruuvi.js');

module.exports = new Ruuvi(adapter);