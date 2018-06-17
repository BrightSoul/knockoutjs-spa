define(['vendor/knockout', 'services/navigator'], function(ko, navigator) {
    var _update;

    function ProductsViewModel(params) {
        _update = handleUpdates.bind(this);
        this.products = [{id: 1, name: 'Product 1'}, {id: 2, name: 'Product 2'}, {id: 3, name: 'Product 3'}];
        this.tabs = ['info', 'prices', 'reviews'];
        this.selectedProduct = ko.observable(null);
        this.selectedTab = ko.observable(null);
        _update(params.componentName, params);

        this.selectProduct = function(product) {
            navigator.push(params.componentName, {id: product.id});
        }.bind(this);

        this.selectTab = function(tab) {
            this.selectedTab(tab);
            navigator.push(params.componentName, {id: this.selectedProduct().id, tab: tab}, true);
        }.bind(this);

        navigator.onNavigated(_update, params.componentName);
        this.dispose = function() {
            navigator.offNavigated(_update);
        };
    };

    function handleUpdates(componentName, params) {
        if (params.id) {
            this.selectedProduct({name: "Product " + params.id, id: params.id});
        } else {
            this.selectedProduct(null);
        }
        this.selectedTab(params.tab || "info");
    }

    return ProductsViewModel;
});