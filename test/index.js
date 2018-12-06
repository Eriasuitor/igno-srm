const supertest = require('supertest')

describe('basic function test', () => {
    it('get before post should return 404', async () => {
        await supertest('http://localhost:10086')
            .get('/a/b/c')
            .expect(404)
    })
    it('put when not existed will return 404', async () => {
        await supertest('http://localhost:10086')
            .put('/a/b/c')
            .expect(404)
    })
    it('post when not existed will return 200', async () => {
        await supertest('http://localhost:10086')
            .post('/a/b/c')
            .send({
                request: {
                    idNumber: "123123",
                    bankCard: {
                        bankName: "中国人民很行",
                        number: "123123"
                    }
                }
            })
            .expect(200)
    })
    it('post when existed will return 409', async () => {
        await supertest('http://localhost:10086')
            .post('/a/b/c')
            .send({
                request: {
                    idNumber: "123123",
                    bankCard: {
                        bankName: "中国人民很行",
                        number: "123123"
                    }
                }
            })
            .expect(409)
    })
    it('put when existed will return 200', async () => {
        await supertest('http://localhost:10086')
            .put('/a/b/c')
            .send({
                request: {
                    bankCard: {
                        bankName: "中国人民很行",
                        number: "123123"
                    }
                }
            })
            .expect(200)
    })
    it('get when existed will return 200', async () => {
        await supertest('http://localhost:10086')
            .get('/a/b/c')
            .expect(200, JSON.stringify({
                request: {
                    bankCard: {
                        bankName: "中国人民很行",
                        number: "123123"
                    }
                }
            }))
            
    })
    it('delete when existed will return 200', async () => {
        await supertest('http://localhost:10086')
            .delete('/a/b/c')
            .expect(200)
    })
    it('delete when not existed will return 404', async () => {
        await supertest('http://localhost:10086')
            .delete('/a/b/c')
            .expect(404)
    })
})