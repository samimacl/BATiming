function showNotification(title, message, doError) {
    myApp.addNotification({
        "title": title != null || title != '' ? 'BATiming - ' + title : 'BATiming',
        "message": message
    });
    if (doError)
        throw new Error(message);
};

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