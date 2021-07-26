const express = require('express')
//const bodyParser = require('body-parser');

const app = express()

let port = process.env.PORT || 3000

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// Set your app credentials
const credentials = {
    apiKey: '83a856ef45150c8227c327f4d4da9a6e5c4fc9774f8a8a69e6ba63632fc8ddbf',
    username: 'sandbox',
}

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials)

// Get the SMS service
const sms = AfricasTalking.SMS
const voice = AfricasTalking.VOICE
const payments = AfricasTalking.PAYMENTS

//const adUrl = ""

async function initiateMobileB2C(phoneNumber) {
    const productName = ""
    const recipients = [{
        phoneNumber: phoneNumber,
        currencyCode: "KES",
        amount: "100",
        metadata: {
            "ad":"1"
        },
        reason: "ad listen payment"
    }]

    try {
        const response = await payments.mobileB2C(productName, recipients)
        console.log(response)
        sms.send(phoneNumber, `Thanks for using AdApp!`)
    } catch (err) {
        console.log(err)
        sms.send(phoneNumber, `Sorry, something went wrong. Please try again.`)
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/voicecall', (req, res) => {

    const { isActive, callerNumber, dtmfDigits, recordingUrl } = req.body;

    let responseActions = ''

    let state = isActive === '1' ? session : '';

    switch (state) {
        case 'menu':
            session = 'process'
            responseActions = `<Say>Hello bot ${callerNumber ? callerNumber : 'There'}</Say>
            <GetDigits timeout="1" finishOnKey="#">
                <Say>Press 1 to listen to some song. Press 2 to talk to a representative. Press 3 to hangup and quit</Say>
            </GetDigits>`

            break
        case 'process':
            switch(dtmfDigits) {
                case '1':
                    session = "menu"
                    responseActions = `<Say>Here is your ad</Say>
                    <Say>This is an ad and you may not think it is and you're right. Haha</Say><Say>Thanks for listening to the ad, we'll send your compensation shortly.`
                    payments
                    break
                case '2':
                    session = undefined
                    responseActions = `<Say>We are getting our resident human on the line for you, please wait while enjoying this nice tune. You have 30 seconds to enjoy a conversation with them</Say>
                    <Dial phoneNumbers="+254724821003" maxDuration="30" sequential="true"/>`;
                    break
                case '3':
                    session = undefined
                    responseActions = `<Say>Bye Bye, Long Live Our Machine Overlords!</Say><Reject/>`
                    break
                default:
                    session = 'menu'
                    responseActions = `<Say>Something seems to have gone wrong, please try again</Say>`
                    break
            }
        default:
            responseActions = `<Say>Something seems to have gone wrong, please try again</Say>`
    }
    let response = `<?xml version="1.0" encoding="UTF-8"?><Response>${responseActions}</Response>`
    res.send(response)

})

app.listen(port, () => {
    console.log(`App is running... on port ${port}`);
});
