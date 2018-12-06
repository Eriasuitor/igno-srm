const Logger = require('./logger')
const Server = require('./server')

try {
    new class extends Server {
        info(desc, data = '') {
            Logger.info(desc, data)
        }

        error(desc, data = '') {
            Logger.error(desc, data)
        }
    }(10086)
} catch (error) {
    Logger.error(error)
}