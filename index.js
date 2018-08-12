require(['vendor/knockout', 'services/identity', 'services/navigator'], function (ko, identity, navigator) {
    function IndexViewModel() {
        this.identity = identity;
        this.navigator = navigator;
        this.menuOpen = ko.observable(false);
        this.actionsOpen = ko.observable(false);
        this.hasActions = ko.observable(false);
        this.searchOpen = ko.observable(false);
        this.modalOpen = ko.observable(false);
        this.goBack = function() {
            if (navigator.canGoBack()) {
                navigator.pop();
            } else {
                navigator.popToRoot(navigator.defaultComponent(), {});
            }
        }.bind(this);

        this.toggleMenu = function() {
            toggleState(this.menuOpen, [this.actionsOpen, this.searchOpen]);
        }.bind(this);

        this.toggleActions = function() {
            toggleState(this.actionsOpen, [this.menuOpen, this.searchOpen]);
        }.bind(this);

        this.toggleSearch = function() {
            toggleState(this.searchOpen, [this.menuOpen, this.actionsOpen]);
        }.bind(this);

        this.toggleModal = function() {
            toggleState(this.modalOpen, [this.menuOpen, this.actionsOpen, this.searchOpen]);
        }.bind(this);

        this.closeOverlays = function() {
            this.modalOpen(false);
            this.menuOpen(false);
            this.actionsOpen(false);
            this.searchOpen(false);
        }.bind(this);

        this.conditionallyCloseOverlays = function(vm, event) {
            var canClose = true;
            var element = event.target;
            while (element) {
                if (element.id == "navbar" || element.id == "overlays") {
                    canClose = false;
                    break;
                } else {
                    element = element.parentElement;
                }
            }
            if (canClose) {
                this.closeOverlays();
            }
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

    function toggleState(observable, closeOthers) {
        observable(!observable());
        if (closeOthers) {
            for (var i = 0; i < closeOthers.length; i++) {
                closeOthers[i](false);
            }
        }
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
        configureCustomBindings();
        var vm = new IndexViewModel();
        ko.applyBindings(vm);
    }

    function configureCustomBindings() {
        //TODO:
    }

    loadConfiguration()
    .then(function(response) { return response.json(); })
    .then(function(config) {
        configureComponents(config.components);
        configureRoutes(config.routes);
        bindViewModel();
    });
});