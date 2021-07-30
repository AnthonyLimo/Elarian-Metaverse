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
        amount: 100.00,
        metadata: {
            "ad":"1"
        },
        reason: "PromotionPayment"
    }];

    try {
        const response = await payments.mobileB2C({ productName, recipients });
        console.info(response);

        sms.send({ to: phoneNumber, message: 'Thanks for using AdApp!' });
    } catch (err) {
        console.error(err);
        sms.send({ to: phoneNumber, message: 'Sorry, something went wrong. Please try again.' });
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/voicecall', (req, res) => {
    const voiceBuilder = new voice.ActionBuilder;

    const { isActive, callerNumber, dtmfDigits } = req.body;

    if (isActive === '0') return;

    let response;

    if (!dtmfDigits) {
        console.info(`Received a phone call from loyal customer ${callerNumber}`);

        const sayText = 'Hello there!';

        const sayOptions = { response: 'woman', playBeep: false };

        const getDigitsText = { say: { text: 'Press 1 to listen to some ad. Press 2 to talk to a representative. Press 3 to hangup and quit.' } };

        const getDigitsOptions = { numDigits: 1, timeout: 10, finishOnKey: '#' };

        response = voiceBuilder
            .say(sayText, sayOptions)
            .getDigits(getDigitsText, getDigitsOptions)
            .build();
    } else {
        switch (dtmfDigits) {
            case '1': {
                const sayText1 = 'Here is your ad';

                const sayText2 = 'This is an ad and you may not think it is and you\'re right. Haha.';

                const sayText3 = 'Thanks for listening to the ad, we\'ll send your compensation shortly.';

                const sayOptions = { response: 'woman', playBeep: true };

                initiateMobileB2C(callerNumber);

                response = voiceBuilder
                    .say(sayText1, sayOptions)
                    .say(sayText2, sayOptions)
                    .say(sayText3, sayOptions)
                    .build();

                break;
            }

            case '2': {
                const sayText1 = 'We are getting our resident human on the line for you, please wait while enjoying this nice tune.';

                const sayText2 = 'You have 30 seconds to enjoy a conversation with them';

                const sayOptions = { response: 'woman', playBeep: true };

                const dialNumber = '+254717421044';

                const dialOptions = { sequential: true, maxDuration: 30 };

                response = voiceBuilder
                    .say(sayText1, sayOptions)
                    .say(sayText2, sayOptions)
                    .dial(dialNumber, dialOptions)
                    .build();

                break;
            }

            case '3': {
                const sayText = 'Bye Bye, Long Live Our Machine Overlords!';

                const sayOptions = { response: 'woman', playBeep: true };

                response = voiceBuilder
                    .say(sayText, sayOptions)
                    .build();

                break;
            }

            default: {
                const sayText = 'Something seems to have gone wrong, we\'re gonna hang up for now.';

                const sayOptions = { response: 'woman', playBeep: true };

                response = voiceBuilder
                    .say(sayText, sayOptions)
                    .build();
            }
        }
    }

    res.send(response);
})

app.listen(port, () => {
    console.log(`App is running... on port ${port}`);
});
