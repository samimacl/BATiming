var storageManager = (function () {
    let self = this;
    let prefix = 'BATiming';

    storageManager.getAllItems = async function () {
        var items = [];
        for (var item in localStorage) {
            if (startsWith(item, prefix)) {
                var key = self.getItem(item);
                var value = [key, ';', self.getItem(key)];
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

    this.clear = function () {
        localStorage.clear();
    };
})();