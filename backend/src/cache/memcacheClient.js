import memcached from '../config/memcacheConfig.js';
import { logInfo } from '../log/log.js';

export const setValue = (key, value, time) => {
    memcached.set(key, value, time, function (err) {
        logInfo('[memcached]setValue', `${key}: ${value}, time: ${time}`);
        if (err) {
            console.error('Error setting key:', err);
        } else {
            console.log('Key "myKey" set successfully with a 60-second lifetime.');
        }
    });
}

export const getValue = (key) => {
    memcached.get(key, (err, val) => {
        logInfo('[memcached]getValue', key);
        if (err) throw err;
        return val;
    });
}