const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jasonmaif@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Please make yourself at home!`
  })
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jasonmaif@gmail.com',
    subject: `Sorry to see you go.`,
    text: `We thank you for choosing us ${name}! You are welcome back here anytime!`
  })
}

module.exports = { sendWelcomeEmail, sendCancellationEmail }