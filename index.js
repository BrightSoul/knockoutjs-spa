require(['vendor/knockout', 'vendor/route', 'services/identity'], function (ko, route, identity) {
    
    function ViewModel() {
        this.identity = identity;
        this.menu = ["home", "customers", "status"];
        this.currentComponent = ko.observable({name: "home"});
        this.changePage = function (component) {
            route(component);
        };
    }
    var vm = new ViewModel();
    
    ko.components.register('login', {
        viewModel: { require: 'components/login/login' },
        template: { require: 'vendor/text!components/login/login.html' }
    });
    ko.components.register('home', {
        viewModel: { require: 'components/home/home' },
        template: { require: 'vendor/text!components/home/home.html' }
    });

    ko.components.register('customers', {
        viewModel: { require: 'components/customers/customerList' },
        template: { require: 'vendor/text!components/customers/customerList.html' }
    });

    ko.components.register('customer', {
        viewModel: { require: 'components/customers/customerDetail' },
        template: { require: 'vendor/text!components/customers/customerDetail.html' }
    });

    ko.components.register('widget1', {
        viewModel: { require: 'components/home/widgets/widget1/widget1' },
        template: { require: 'vendor/text!components/home/widgets/widget1/widget1.html' }
    });

    ko.components.register('widget2', {
        viewModel: { require: 'components/home/widgets/widget2/widget2' },
        template: { require: 'vendor/text!components/home/widgets/widget2/widget2.html' }
    });

    ko.components.register('page', {
        viewModel: { require: 'components/home/widgets/page/page' },
        template: { require: 'vendor/text!components/home/widgets/page/page.html' }
    });


    ko.applyBindings(vm);

    //Altri router
    //https://github.com/riot/route
    //https://github.com/tildeio/router.js
    //https://github.com/krasimir/navigo

    route('/customers', function () {
        vm.currentComponent({name:"customers"});
    });

    route('/customers/*', function (id) {
        vm.currentComponent({name: "customers", params: { id: id }});
    });
    
    route('/', function (name) {
        vm.currentComponent({name: "home"});
    });

    route('/home', function (name) {
        vm.currentComponent({name: "home"});
    });

    route('/..', function() {
        alert(404);
    });
    //TODO: se il browser supporta la history api
    //route.base('/');
    route.start(true);

});