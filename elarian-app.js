require('dotenv').config()
const { Elarian } = require('elarian')

const client = new Elarian({
    orgId: process.env.ELARIAN_ORG_ID,
    appId: process.env.ELARIAN_APP_ID,
    apiKey: process.env.ELARIAN_API_KEY
})

client
    .on('error', error => {
        console.log(`Connection failed with error: `, error)
    })
    .on('connected', async () => {
        console.log('App is connected!')
        const newCustomer = new client.Customer({
            provider: 'cellular',
            number: '+254727545805'
        })

        const resp = await newCustomer.sendMessage(
            { number: process.env.ELARIAN_SMS_CHANNEL, channel: 'sms' },
            {
                body: {
                    text: "Hello, send me a text :)"
                }
            }
        )

        console.log(resp)
    })
    .on('receivedSms', (notification, customer) => {
        console.log(`Message recieved...`, JSON.stringify(notification))
        customer.sendMessage(
            {number: process.env.ELARIAN_SMS_CHANNEL, channel: 'sms'},
            {
                body:
                {
                    text: "Thanks for texting back!"
                }
            }
        ).then(console.log)
        .catch(console.log)
    })
    .on('voiceCall', async (notification, customer, appData, callback) => {
        console.log('Call recieved: ', JSON.stringify(notification))

        const actions = [{
            say: {
                text: 'Hello, world',
                voice: 'male'
            }
        }]

        callback(actions, appData)
    })
    .connect()