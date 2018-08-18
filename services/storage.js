define(['services/vendor/knockout'], function(ko) {
    function ClientSideStorage() {
    }
    ClientSideStorage.prototype.save = function(key, object) {
        if (object === null || object === undefined) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(object));
        }
    };
    ClientSideStorage.prototype.load = function(key) {
        var item = localStorage.getItem(key);
        return item === null ? null : JSON.parse(item);
    };
    return new ClientSideStorage();
});