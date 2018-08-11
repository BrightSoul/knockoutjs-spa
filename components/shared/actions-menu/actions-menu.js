define(['vendor/knockout', 'services/bus'], function(ko, bus) {

    return function ActionsMenuViewModel(params) {
        
        this.actionTemplate = ko.observable(null);
        this.updateActions = function(message) {
            this.actionTemplate({
                id: message.templateId,
                data: message.data,
                nodes: message.nodes
            });
        }.bind(this);
        var subscription = bus.subscribe('actionsUpdated', this.updateActions);

        this.dispose = function() {
            bus.unsubscribe(subscription);
        }.bind(this);
    };

});