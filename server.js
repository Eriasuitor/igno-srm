const express = require('express')
const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
module.exports = class Api {
    constructor(port, resourceDir = path.join(__dirname, 'static')) {
        this.resourceDir = resourceDir
        if(!fs.existsSync(this.resourceDir)) mkdirp.sync(this.resourceDir)
        if(!fs.lstatSync(this.resourceDir).isDirectory) throw new Error(`${this.resourceDir} is not a folder, use a folder to save resource please`)
        this.app = express()
        this.app.post('/*', this.save.bind(this))
        this.app.put('/*', this.modify.bind(this))
        this.app.delete('/*', this.delete.bind(this))
        this.app.use(express.static(path.join(__dirname, 'static'), { fallthrough: false }))
        this.app.use((err, req, resp, next) => {
            resp.sendStatus(err && err.status || 500)
            this.error('operation failed', { url: req.url, method: req.method, err })
        })
        this.app.listen(port, () => {
            this.info('Server start success')
        })
    }

    save(req, resp, next) {
        try {
            this.info(111)
            let url = path.join(this.resourceDir, req.url)
            if (fs.existsSync(url)) {
                this.info('save failed because existed', { url })
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

    modify(req, resp, next) {
        try {
            let url = path.join(this.resourceDir, req.url)
            if (!fs.existsSync(url)) {
                this.info('modify failed because not existed', { url })
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

    delete(req, resp, next) {
        try {
            let url = path.join(this.resourceDir, req.url)
            if (!fs.existsSync(url)) {
                this.info('delete failed because not existed', { url })
                return resp.sendStatus(404)
            }
            fs.unlinkSync(url)
            this.info('delete success', { url })
            resp.sendStatus(200)
        } catch (err) {
            next(err)
        }
    }

    info(desc, data = '') {
        console.info(desc, data)
    }

    error(desc, data = '') {
        console.error(desc, data)
    }
}