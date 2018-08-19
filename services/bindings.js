define(['services/vendor/knockout', 'services/singleton', 'services/localization'], function(ko, singleton, localization) {

    function Bindings() {
        var bindingsRegistered = false;
        this.registerCustomBindings = function() {
            if (bindingsRegistered) {
                console.error("Bindings were already registered");
                return;
            }

            registerLocalizationBindings();
            bindingsRegistered = true;
        };
    }
    return singleton.create(Bindings);


    function registerLocalizationBindings() {
        ko.bindingHandlers.restext = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var text = getLocalizedText(ko.utils.unwrapObservable(valueAccessor()));
                ko.bindingHandlers.text.update(
                    element,
                    function () { return text; },
                    allBindingsAccessor,
                    viewModel,
                    context);
            }
        };
    
        ko.bindingHandlers.reshtml = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var text = getLocalizedText(ko.utils.unwrapObservable(valueAccessor()));
                ko.bindingHandlers.html.update(
                    element,
                    function () { return text; },
                    allBindingsAccessor,
                    viewModel,
                    context);
            }
        };
    
        ko.bindingHandlers.reshref = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var text = getLocalizedText(ko.utils.unwrapObservable(valueAccessor()));
                ko.bindingHandlers.attr.update(
                    element,
                    function () { return { href: text }; },
                    allBindingsAccessor,
                    viewModel,
                    context);
            }
        };
    
        ko.bindingHandlers.ressrc = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var text = getLocalizedText(ko.utils.unwrapObservable(valueAccessor()));
                ko.bindingHandlers.attr.update(
                    element,
                    function () { return { src: text }; },
                    allBindingsAccessor,
                    viewModel,
                    context);
            }
        };
    
        ko.bindingHandlers.resattr = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
                var json = ko.utils.unwrapObservable(valueAccessor());
                for (var attr in json) {
                    var text = getLocalizedText(json[attr]);
                    ko.bindingHandlers.attr.update(
                        element,
                        function () { var x = {}; x[attr] = text; return x; },
                        allBindingsAccessor,
                        viewModel,
                        context);
                }
            }
        };
    
        function getLocalizedText(binding) {
            if (!('resources' in localization)) {
                console.error("Resources not found in localization");
                return "---";
            }
            var resources = localization.resources();
    
            // Accept both restext: 'mytext' and restext: { key: 'mytext' }
            if (Object.prototype.toString.call(binding) === '[object String]') {
                binding = { key: binding };
            }
    
            var key = binding.key;
            var text = "";
            if (key in resources) {
                text = resources[key];
            } else {
                text = "---" + key + "---";
            }
    
            // Handle placeholders, where the localized text can be 'Hello #firstName!'. 
            // For parameterized text the binding will look like restext: { key: 'hello', params: { firstName: firstNameObservable } }
            if (binding.params) {
                for (var replaceKey in binding.params) {
                    var replacement = binding.params[replaceKey];
                    if (typeof replacement === "function") {
                        replacement = ko.utils.unwrapObservable(replacement());
                    }
                    text = text.replace("#" + replaceKey, replacement);
                }
            }
    
            return text;
        }
        ko.bindingHandlers.restext.getText = getLocalizedText;
    };
});