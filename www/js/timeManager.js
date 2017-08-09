var timeManager = (function () {
    let timeManager = {};

    let state = 0;

    timeManager.startWorkflow = async function () {
        if (state > 0)
            throw Error('Workflow already started.');
        // check, whether localStorage for lesson is stored
        // if not, load data through database object
        let id = 5;
        let data = await storageManager.getItem(id);
        //if (data == null)
            // data = await Database.get
    }

    return timeManager;
})();