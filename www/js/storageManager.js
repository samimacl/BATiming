/* ----------------------------------------------------------------------------- 
 *
 *   storageManager.js - Util-Klasse für Zugriff auf localStorage.
 *
 *   (c) 2017 WS14-II - Tobias Groß, Sascha Knöchel, Andreas Garben, Atiq Butt
 *
 *  ------------------------------------------------------------------------- */

var storageManager = (function () {
    let storageManager = {};
    let prefix = 'BATiming';
    let separator = '_';

    storageManager.getAllItems = function () {
        var items = [];
        for (var item in localStorage) {
            if (storageManager.startsWith(item, prefix)) {
                var key = this.getItem(item);
                var value = [key, ';', this.getItem(key)];
                items.push(value.join(''));
            }
        }
        return items;
    };

    storageManager.startsWith = function (key, value) {
        return (key.indexOf(value) == 0);
    };

    storageManager.getPrefix = function () {
        return prefix;
    };

    storageManager.addItem = function (withPrefix, key, value) {
        if (this.getItem(withPrefix, key) === null) {
            let keyName = withPrefix === true ? prefix + separator + key : key;
            localStorage.setItem(keyName, JSON.stringify(value));
        }
    };

    storageManager.changeItem = function (withPrefix, key, newValue) {
        let keyName = withPrefix === true ? prefix + separator + key : key;
        localStorage.setItem(keyName, JSON.stringify(newValue));
    }

    storageManager.getItem = function (withPrefix, key) {
        return withPrefix === true ? localStorage.getItem(prefix + separator + key) : localStorage.getItem(key);
    };

    storageManager.removeItem = function (withPrefix, key) {
        return withPrefix === true ? localStorage.removeItem(prefix + separator + key) : localStorage.removeItem(key);
    };

    storageManager.clear = function () {
        localStorage.clear();
    };

    storageManager.setPrefix = function (pre) {
        if (pre != null && pre !== "")
            prefix = pre;
    };

    storageManager.getPrefix = function () {
        return prefix;
    };

    return storageManager;
})();