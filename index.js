require(['vendor/knockout', 'services/identity', 'services/navigator'], function (ko, identity, navigator) {
    
    function IndexViewModel() {
        this.identity = identity;
        this.menu = ['home', 'customerList', 'products', 'status'];
        this.navigator = navigator;
        this.selectSection = function(section) {
            navigator.popToRoot(section);
        }.bind(this);
    }

    function loadConfiguration() {
        return fetch('/config.json');
    }

    function configureComponents(components) {
        for (var component in components) {
            var path = components[component];
            ko.components.register(component, {
                viewModel: { require: 'components/' + path },
                template: { require: 'vendor/text!components/' + path + '.html' }
            });
        }
    }

    function configureRoutes(routes) {
        var nav = navigator;
        for (var mapping in routes.mappings) {
            nav = nav.route(mapping, routes.mappings[mapping]);
        }
        nav.route404(routes.notFound).start(routes.default);
    }

    function bindViewModel() {
        var vm = new IndexViewModel();
        ko.applyBindings(vm);
    }

    loadConfiguration()
    .then(function(response) { return response.json(); })
    .then(function(config) {
        configureComponents(config.components);
        configureRoutes(config.routes);
        bindViewModel();
    });
 
    //Altri router
    //https://github.com/riot/route
    //https://github.com/tildeio/router.js
    //https://github.com/krasimir/navigo

});