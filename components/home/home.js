define(['vendor/knockout'], function(ko) {

    return function HomeViewModel() {
        this.viewModels = ko.observable(['page']);
    };
});