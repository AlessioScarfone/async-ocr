import https from 'https';
import http from 'http';
import env from '../config/env';

const scheduleWakeUp = () => {
    const time = env.wakeUp.time;
    console.log("⏰ Setup auto wake up");
    if (env.wakeUp.url) {
        const url = new URL(env.wakeUp.url);
        const client = (url.protocol == "https:") ? https : http
        setInterval(function() {
            client.get(url, () => {
                console.log("⏰ Wake Up ...");
            })
        }, time);
    }
}

export default scheduleWakeUp;