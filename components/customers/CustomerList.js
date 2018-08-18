define(['services/vendor/knockout', 'services/navigator'], function(ko, navigator) {

    return function CustomerListViewModel(params) {
        this.title = "Customers";
        this.customers = [
            { id: 1, name: "Customer1"},
            { id: 2, name: "Customer2"},
            { id: 3, name: "Customer3"}
        ];
        
        this.selectCustomer = function(customer) {
            navigator.push('customerDetail', {id: customer.id});
            /*if (customer != this.selectedCustomer()) {
                this.selectedCustomer(customer);
                route("customers/" + customer.id);
            }*/
        }.bind(this);

        this.selectedCustomer = ko.observable(null);
        if (params && ('id' in params)) {
            var selected = this.customers.filter(function(c) { return c.id == params.id; });
            if (selected.length > 0) {
                this.selectedCustomer(selected[0]);
            }
        }
    };
});