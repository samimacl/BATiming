function AppError(message) {
    this.message = message;
};

AppError.prototype = new Error;

var window_onerror = window.onerror || function () {
    return false;
};
window.onerror = function (message, url, line) {
    if (message.startsWith('BATiming')) {
        myApp.addNotification({
            "title": 'App Error',
            "message": message.slice(8)
        });
    } else {
        console.log(window_onerror(message, url, line));
    }
};