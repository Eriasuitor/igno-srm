const express = require('express')
const path = require('path')
const fs = require('fs')

Object.assign(global, require('./logger'))

class Api {
    constructor() {
        this.resourceDir = path.join(__dirname, 'static')
        this.app = express()
        this.app.use(express.static(path.join(__dirname, 'static')))
        this.app.use(require('body-parser').raw())
        this.app.post('/*', this.save(this))
        this.app.put('/*', this.modify(this))
        this.app.delete('/*', this.delete(this))
        this.app.use((req, resp) => {
        })
        this.app.use((err, req, resp, next) => {
            resp.sendStatus(500)
            console.log(err.message)
            this.error('operation failed', { url, method: req.method, err })
        })
        this.app.listen(1001)
    }

    save(self) {
        return (req, resp, next) => {
            try {
                console.log(req.body)
                let url = path.join(self.resourceDir, req.url)
                if (fs.existsSync(url)) {
                    this.debug('save failed because existed', { url })
                    return resp.sendStatus(409)
                }
                let urlList = req.url.split('/')
                urlList.slice(1, urlList.length - 1).reduce((a, b) => {
                    let currentPath = path.join(a, b)
                    if (!fs.existsSync(currentPath)) fs.mkdirSync(currentPath)
                    return currentPath
                }, self.resourceDir)
                fs.writeFileSync(url, req.body)
                this.info('save success', { url })
                resp.sendStatus(200)
            } catch (err) {
                next(err)
            }
        }
    }

    modify(self) {
        return (req, resp, next) => {
            try {
                let url = path.join(self.resourceDir, req.url)
                if (!fs.existsSync(url)) {
                    this.debug('modify failed because not existed', { url })
                    return resp.sendStatus(404)
                }
                fs.writeFileSync(url, req.body)
                this.info('modify success', { url })
                resp.sendStatus(200)
            } catch (err) {
                next(err)
            }
        }
    }

    delete(self) {
        return (req, resp, next) => {
            try {
                let url = path.join(self.resourceDir, req.url)
                if (!fs.existsSync(url)) {
                    this.debug('delete failed because not existed', { url })
                    return resp.sendStatus(404)
                }
                fs.unlinkSync(url)
                this.info('delete success', { url })
                resp.sendStatus(200)
            } catch (err) {
                next(err)
            }
        }
    }

    debug(desc, data) {
        console.log(desc, data)
    }

    info(desc, data) {
        console.info(desc, data)
    }

    error(desc, data) {
        console.error(desc, data)
    }
}

global.console = Logger

new Api()

WebLogger.info('Api启动成功')