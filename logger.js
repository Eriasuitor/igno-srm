const Log4js = require('log4js')
const path = require('path')

Log4js.configure({
    appenders: {
        web: {
            type: 'dateFile',
            filename: path.join(__dirname, '/logs/web'),
            pattern: '/yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ['web'], level: 'ALL' },
    }
})

module.exports = Log4js.getLogger('default')