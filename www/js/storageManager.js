var storageManager = (function () {
    let storageManager = {};
    let prefix = 'BATiming';

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

    storageManager.addItem = async function (category, key) {
        localStorage[prefix + category] = key;
    };

    storageManager.getItem = async function (key) {
        return localStorage.getItem(key);
    };

    storageManager.removeItem = async function (key) {
        localStorage.removeItem(key);
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