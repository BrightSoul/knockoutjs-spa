define(['vendor/knockout', 'services/bus'], function(ko, bus) {

    var defaultTitle = { data: null, nodes: [] };

    return function PageTitleContainerViewModel(params) {
        this.title = ko.observable(null);
        
        var updateSubscription = bus.subscribe('titleUpdated', onTitleUpdated.bind(this));
        var navigatingSubscription = bus.subscribe('navigating', onNavigating.bind(this));

        this.dispose = function() {
            bus.unsubscribe(updateSubscription);
            bus.unsubscribe(navigatingSubscription);
        };
    };

    function onTitleUpdated(message) {
        this.title({
            data: message.data,
            nodes: message.nodes
        });
    }

    function onNavigating(message) {
        this.title(null);
    }

});