define(['vendor/knockout', 'services/singleton', 'services/storage'], function(ko, singleton, storage) {
    var _user = ko.observable(storage.load("user"));

    function UserIdentity() {
        this.user = ko.pureComputed(function() {
            return _user();
        });
        this.login = function(username) {
            storage.save("user", username);
            _user(username);
        };
        this.logout = function() {
            storage.save("user", null);
            _user(null);
        }
    }
    return singleton.create(UserIdentity);
});