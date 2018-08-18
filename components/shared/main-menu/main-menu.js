define(['services/vendor/knockout', 'services/identity', 'services/navigator'], function(ko, identity, navigator) {
    return function MainMenuViewModel() {
        this.menu = ['home', 'customerList', 'products', 'status'];
        this.password = ko.observable("");
        this.navigator = navigator;
        this.selectSection = function(section) {
            navigator.popToRoot(section);
        }.bind(this);
        this.logout = function() {
            identity.logout();
        }.bind(this);
    };
});