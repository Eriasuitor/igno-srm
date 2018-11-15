const express = require('express')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')

Object.assign(global, require('./logger'))

class Api {
    constructor() {
        this.resourceDir = path.join(__dirname, 'static')
        this.app = express()
        // this.app.use(require('body-parser').raw({
        //     type: req => req.headers["content-type"]
        // }))
        // this.app.use((req, resp, next) => {
        //     req.body = []
        //     req.on('data', chunk => {
        //         req.body.push(chunk)
        //     })
        //     req.on('end', () => {
        //         req.body = Buffer.concat(req.body)
        //         next()
        //     })
        // })
        this.app.post('/*', this.save(this))
        this.app.put('/*', this.modify(this))
        this.app.delete('/*', this.delete(this))
        this.app.use(express.static(path.join(__dirname, 'static'), {
            fallthrough: false
        }))
        this.app.use((err, req, resp, next) => {
            resp.sendStatus(err && err.status || 500)
            this.error('operation failed', { url: req.url, method: req.method, err })
        })
        this.app.listen(1001)
    }

    save(self) {
        return (req, resp, next) => {
            try {
                let url = path.join(self.resourceDir, req.url)
                if (fs.existsSync(url)) {
                    this.debug('save failed because existed', { url })
                    return resp.sendStatus(409)
                }
                mkdirp.sync(url.substring(0, url.length - 1))
                req.on('end', err => {
                    if (err) return next(err)
                    this.info('save success', { url })
                    resp.sendStatus(200)
                })
                req.pipe(fs.createWriteStream(url))
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
                req.on('end', err => {
                    if (err) return next(err)
                    this.info('modify success', { url })
                    resp.sendStatus(200)
                })
                req.pipe(fs.createWriteStream(url))
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
new class extends Api {
    debug(desc, data) {
        Logger.debug(desc, data)
    }
    info(desc, data) {
        Logger.info(desc, data)
    }
    error(desc, data) {
        Logger.error(desc, data)
    }
}()

WebLogger.info('Api启动成功')