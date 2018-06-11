define(['vendor/knockout', 'services/navigator'], function(ko, navigator) {

    return function NotFoundViewModel() {
        this.navigator = navigator;
    };

});