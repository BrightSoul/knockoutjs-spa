define(['services/vendor/knockout', 'services/navigator', 'services/bus'], function(ko, navigator, bus) {

    function ProductsViewModel(params) {
        var update = handleUpdates.bind(this);
        this.products = [{id: 1, name: 'Product 1'}, {id: 2, name: 'Product 2'}, {id: 3, name: 'Product 3'}];
        this.tabs = ['info', 'prices', 'reviews'];
        this.selectedProduct = ko.observable(null);
        this.selectedTab = ko.observable(null);
        update({ componentName: params.componentName, params: params });

        this.selectProduct = function(product) {
            navigator.push(params.componentName, {id: product.id});
        }.bind(this);

        this.selectTab = function(tab) {
            this.selectedTab(tab);
            navigator.push(params.componentName, {id: this.selectedProduct().id, tab: tab}, true);
        }.bind(this);

        var subscription = bus.subscribe('navigated', update, function(message) { return message.componentName == params.componentName; });
        this.dispose = function() {
            bus.unsubscribe(subscription);
        };
    };

    function handleUpdates(message) {
        if (message.params.id) {
            this.selectedProduct({name: "Product " + message.params.id, id: message.params.id});
        } else {
            this.selectedProduct(null);
        }
        this.selectedTab(message.params.tab || "info");
    }

    return ProductsViewModel;
});