define(['vendor/knockout', 'services/navigator'], function(ko, navigator) {

    return function HomeViewModel() {
        this.state = ko.observable(null);

        this.navigateToCustomers = function() {
            navigator.push('customerList');
        };
        this.navigateToProducts = function() {
            navigator.push('products');
        };
        this.navigateToStatus = function() {
            navigator.push('status');
        }
    };
});