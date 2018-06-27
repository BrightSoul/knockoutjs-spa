require(['vendor/knockout', 'services/identity', 'services/navigator'], function (ko, identity, navigator) {
    function IndexViewModel() {
        this.identity = identity;
        this.navigator = navigator;
        this.menuOpen = ko.observable(false);
        this.modalOpen = ko.observable(false);
        this.goBack = function() {
            if (navigator.canGoBack()) {
                navigator.pop();
            } else {
                navigator.popToRoot(navigator.defaultComponent(), {});
            }
        }.bind(this);

        this.toggleMenu = function() {
            this.menuOpen(!this.menuOpen())
        }.bind(this);

        this.closeOverlays = function() {
            this.modalOpen(false);
            this.menuOpen(false);
        }.bind(this);

        this.loginOpen = ko.pureComputed(function() {
            this.closeOverlays();
            return !identity.user();
        }.bind(this));
        
        this.currentComponent = ko.pureComputed(function() {
            this.closeOverlays();
            return navigator.currentComponent();
        }.bind(this));
    }

    function loadConfiguration() {
        return fetch('/config.json');
    }

    function configureComponents(components) {
        for (var component in components) {
            var path = components[component];
            var suffix = "?v=" + Math.random().toString();
            ko.components.register(component, {
                viewModel: { require: 'components/' + path + '.js' + suffix },
                template: { require: 'vendor/text!components/' + path + '.html' + suffix }
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
});