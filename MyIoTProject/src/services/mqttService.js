import storageService from './storageService';
import { Platform } from 'react-native';

const isWeb = Platform?.OS === 'web';

let init = null;
if (!isWeb) {
    // require dynamically to avoid bundling native modules for web
    try {
        // react_native_mqtt exports default init function
        // eslint-disable-next-line global-require
        init = require('react_native_mqtt').default || require('react_native_mqtt');
        init({
            size: 10000,
            storageBackend: null,
            defaultExpires: 1000 * 3600 * 24,
            enableCache: true,
            sync: {},
        });
    } catch (e) {
        // fail quietly; runtime errors will surface when trying to connect
        console.warn('react_native_mqtt init failed', e);
    }
}

export default class MQTTService {
    constructor() {
        this.client = null;
    }

    connect(config, onMessage, onConnect, onFailure) {
        const { host, port, path, user, pass, clientId} = config;

        if (isWeb) {
            setTimeout(() => {
                const err = new Error('MQTT not supported in web build.');
                if (typeof onFailure === 'function') onFailure(err);
            }, 0);
            return;
        }

        // eslint-disable-next-line no-undef
        this.client = new Paho.MQTT.Client(host, port, path, clientId);

        this.client.onMessageArrived = (message) => {
            const topic = message.destinationName;
            const payload = message.payloadString;
            storageService.saveMessage(topic, payload).catch(() => {});
            if (typeof onMessage === 'function') onMessage(topic, payload);
        };

        const options = {
            username: user,
            password: pass,
            useSSL: true,
            onSuccess: onConnect,
            onFailure: onFailure,
            timeout: 3,
            keepAliveInterval: 60,
        };

        this.client.connect(options);
    }

    subscribe(topic) {
        if (isWeb || !this.client) {
            console.warn('subscribe ignored: MQTT not available on web or not connected');
            return;
        }
        this.client.subscribe(topic);
    }

    publish(topic, message) {
        if (isWeb || !this.client) {
            console.warn('publish ignored: MQTT not available on web or not connected');
            return;
        }
        const msg = new Paho.MQTT.Message(message);
        msg.destinationName = topic;
        this.client.send(msg);
    }
}