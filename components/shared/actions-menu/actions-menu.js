define(['vendor/knockout', 'services/bus'], function(ko, bus) {

    return function ActionsMenuViewModel(params) {
        this.actionTemplate = ko.observable(null);
        this.hasActions = params.hasActions;
        
        var updateSubscription = bus.subscribe('actionsUpdated', onActionsUpdated.bind(this));
        var navigatingSubscription = bus.subscribe('navigating', onNavigating.bind(this));

        this.dispose = function() {
            bus.unsubscribe(updateSubscription);
            bus.unsubscribe(navigatingSubscription);
        };
    };

    function onActionsUpdated(message) {
        this.actionTemplate({
            id: message.templateId,
            data: message.data,
            nodes: message.nodes
        });
        this.hasActions(true);
    }

    function onNavigating(message) {
        this.actionTemplate(null);
        this.hasActions(false);
    }

});