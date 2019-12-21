const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const serverless = require('serverless-http')
const sgMail = require('@sendgrid/mail')

const app = express()

const router = express.Router()

app.use(bodyParser.urlencoded({
  limit: '5MB',
  extended: true
}))

app.use(bodyParser.json({ limit: '5MB' }))

const whitelist = [process.env.CORS_WHITELIST_URL]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))

router.post('/form', (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: process.env.EMAIL_TO,
    cc: req.body.form.email ? req.body.form.email : '',
    from: process.env.EMAIL_FROM,
    subject: 'Form message...',
    attachments: req.body.files.length ? req.body.files : [],
    text: '',
    html: ''
  }

  msg.html =
    (req.body.form.email ? "Email: " + req.body.form.email : "") +
    (req.body.form.name ? "<br>Name: " + req.body.form.name : "") +
    (req.body.form.msg ? "<br><br>Message: <br>" + req.body.form.msg : "") +
    (req.body.form.awesome.length ? "<br><br>Awesome: " + req.body.form.awesome : "") +
    (req.body.form.radio.selected ? "<br><br>Radio: " + req.body.form.radio.selected : "") +
    (req.body.form.select.selected ? "<br><br>Select: " + req.body.form.select.selected : "")

  msg.text = msg.html

  sgMail.send(msg, (error) => {
    if(!error) {
        res.status(200).json({ 'message': 'Email was sent.' })
    }
  });
})

app.use('/.netlify/functions/api', router)

module.exports.handler = serverless(app)