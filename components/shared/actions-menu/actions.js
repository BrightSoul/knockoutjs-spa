define(['vendor/knockout', 'services/bus'], function(ko, bus) {

    function ActionsViewModel(params) {
        
    }

    function ActionsViewModelFactory(params, componentInfo) {
        var viewModel = new ActionsViewModel(params);
        bus.send('actionsUpdated', { data: params.data, nodes: componentInfo.templateNodes });
        return viewModel
    }

    return { createViewModel: ActionsViewModelFactory };

});