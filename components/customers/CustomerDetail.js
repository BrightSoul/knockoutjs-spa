define(['vendor/knockout'], function(ko) {

    return function CustomerDetailViewModel(params) {
        this.title = "CustomerDetail";
        this.customer = params.customer;
    };
});