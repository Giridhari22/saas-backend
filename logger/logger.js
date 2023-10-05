const path = require("path");

const logger = require("logger").createLogger(path.join(__dirname, "./logs.log"))

exports.info = function(message) {
    logger.info(message)
}

exports.log = function(message) {
    logger.log(message)
}

exports.error = function(error) {
    logger.error(error)
}