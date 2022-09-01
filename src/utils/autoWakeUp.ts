import https from 'https';
import http from 'http';
import env from '../config/env';

const scheduleWakeUp = () => {
    const time = env.wakeUp.time;
    console.log("⏰ Setup auto wake up");
    if (env.wakeUp.url) {
        const url = new URL(env.wakeUp.url);
        const client = (url.protocol == "https:") ? https : http
        const intervalId = setInterval(function() {
            client.get(url, (res) => {
                console.log("⏰ Wake Up ...", {statusCode: res.statusCode});
                if(res.statusCode == 404) {
                    clearInterval(intervalId);
                    console.log("⏰ Url not found! Stop auto wake up")
                }
            })
        }, time);
    }
}

export default scheduleWakeUp;