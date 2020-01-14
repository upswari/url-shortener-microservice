const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    dns = require('dns')


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./public'))

app.get('/', (req, res) => {
    res.render('index.html')

})

app.post('/api/shorturl/new', (req, res, next) => {
    let url = req.body.f_url,
        hostname = ''

    req.data = { "error": "" }

    if (!isValidProtocol(url)) {
        req.data.error = "Invalid URL"
        next()
    }

    hostname = getHostname(url)
    if (!hostname) {
        req.data.error = "Invalid Hostname"
        next()
    }
    req.data //next do the url shortener
    next()

}, (req, res) => {
    res.json(req.data)

})

function isValidProtocol(url) {
    let t = ['http://', 'https://'],
        ret = t.filter(x => url.match(x))
    if (ret.length > 0) {
        return true
    }
    return false
}

async function isValidHostname(host) {
    const val = await dns.lookup(host, (err, addr) => {
        if (err) {
            return err
        } return addr
    })
    return val
}

function getHostname(url) {
    let u = url.split('/').filter(x => x.includes('.'))
    if (u.length > 0) {
        if (isValidHostname(u.toString())) {
            return true
        }
        return false
    }
    return false
}

app.listen(process.env.PORT || 3000, () => console.log('Running..!'))