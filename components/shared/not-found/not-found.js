define(['vendor/knockout', 'services/navigator'], function(ko, navigator) {

    return function NotFoundViewModel(params) {
        this.url = params.url;
        this.navigator = navigator;
    };

});