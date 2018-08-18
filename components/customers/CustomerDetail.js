define(['services/vendor/knockout'], function(ko) {

    return function CustomerDetailViewModel(params) {
        this.customer = { id: params.id, name: "Customer" + params.id };
    };
});