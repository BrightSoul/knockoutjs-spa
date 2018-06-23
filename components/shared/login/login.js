define(['vendor/knockout', 'services/identity'], function(ko, identity) {

    return function LoginViewModel() {
        this.password = ko.observable("");
        this.login = function() {
            if (this.password() == "password") {
                this.password("");
                identity.login("Mario");
            }
        };
    };

});