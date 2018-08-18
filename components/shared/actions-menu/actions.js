define(['services/vendor/knockout', 'services/bus'], function(ko, bus) {

    function ActionsViewModel(params, parentComponentViewModel, parentComponentParams, nodes) {
        this.params = params;
        this.parentComponentViewModel = parentComponentViewModel;
        this.parentComponentParams = parentComponentParams;
        this.nodes = nodes;
        var navigatedSubscription = bus.subscribe("navigated", onNavigated.bind(this), onNavigatedFilter.bind(this));
        onNavigated.bind(this)();
        this.dispose = function() {
            bus.unsubscribe(navigatedSubscription);
        };
    }

    function ActionsViewModelFactory(params, componentInfo) {
        var bindingContext = ko.contextFor(componentInfo.element);
        var parentComponentViewModel = bindingContext.$component;
        var parentComponentParams = bindingContext.$parent;
        var viewModel = new ActionsViewModel(params, parentComponentViewModel, parentComponentParams, componentInfo.templateNodes);
        return viewModel;
    }

    function onNavigated(message) {
        var data = (('data' in this.params) && this.params.data) ? this.params.data : this.parentComponentViewModel;
        bus.send('actionsUpdated', { data: data, nodes: this.nodes });
    }
    function onNavigatedFilter(message) {
        return (message.componentName == this.parentComponentParams.params.componentName)
                && JSON.stringify(message.params) == JSON.stringify(this.parentComponentParams.params);
    }

    return { createViewModel: ActionsViewModelFactory };

});