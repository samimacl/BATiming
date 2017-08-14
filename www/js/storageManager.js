var storageManager = (function () {
    let storageManager = {};
    let prefix = 'BATiming';
    let separator = '_';

    storageManager.getAllItems = async function () {
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

    storageManager.addItem = async function (withPrefix, key, value) {
        if (localStorage.getItem(withPrefix, key) === null) {
            let keyName = withPrefix === true ? prefix + separator + key : key;
            localStorage.setItem(keyName, JSON.stringify(value));
        }
    };

    storageManager.getItem = async function (withPrefix, key) {
        return withPrefix === true ? localStorage.getItem(prefix + separator + key) : localStorage.getItem(key);
    };

    storageManager.removeItem = async function (withPrefix, key) {
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