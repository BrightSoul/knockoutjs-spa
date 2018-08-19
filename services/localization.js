define(['services/vendor/knockout', 'services/singleton', 'services/storage'], function(ko, singleton, storage) {
    
    var selectedLocale = ko.observable(null);
    var selectedResources = ko.observable(null);
    var allowedLocales = [];

    function Localization() {
        this.locale = ko.pureComputed(function() {
            return selectedLocale();
        });
        this.resources = ko.pureComputed(function() {
            return selectedResources();
        });

        this.changeLocale = function(newLocale) {
            if (!allowedLocales || allowedLocales.length == 0) {
                console.warn("No known locales, invoke init before trying to change the locale");
            }
            if (!newLocale) {
                newLocale = (navigator.language || navigator.userLanguage).split("-")[0];
            }
            if (allowedLocales.indexOf(newLocale) == -1) {
                newLocale = allowedLocales[0];
            }
            storage.save("locale", newLocale);

            fetch('/data/localizations/' + newLocale + '.json')
                .then(function(response) { return response.json(); })
                .then(function(resources) {
                    selectedLocale(newLocale);
                    selectedResources(resources);
                });
        };
        this.init = function(locales) {
            allowedLocales = locales;
            this.changeLocale(storage.load("locale"));
        };
    }
    return singleton.create(Localization);

    
});