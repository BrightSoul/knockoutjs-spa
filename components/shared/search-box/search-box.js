define(['vendor/knockout', 'services/navigator', 'services/bus'], function(ko, navigator, bus) {

    return function SearchBoxViewModel(params) {
        this.resultsShown = ko.observable(false);
        this.query = ko.observable("");
        this.query.subscribe(performSearch.bind(this));
        this.results = ko.observableArray([]);
        this.hasFocus = ko.pureComputed({
            read: function() {
                return params.openObservable();
            },
            write: function(value) {
                if (value) {
                    this.resultsShown(true);
                }
            },
            owner: this
        });
        this.closeSearch = function() {
            params.openObservable(false);
        }.bind(this);

        this.hasResults = ko.pureComputed(function() {
            return this.results().length > 0 && this.resultsShown();
        }.bind(this));

        this.selectResult = function(result) {
            alert("Result selected");
            this.hasFocus(false);
            this.closeSearch();
        }.bind(this);

        var subscription = bus.subscribe('overlaysClosed', closeSearchResults.bind(this));
        this.dispose = function() {
            bus.unsubscribe(subscription);
        };
    };

    function closeSearchResults() {
        this.resultsShown(false);
    }

    function performSearch(query) {
        var results = [];
        if (query) {
            this.resultsShown(true);
            for (var i = 0; i < Math.max(0, 10-query.length); i++) {
                results.push({text: "Result " + i });
            }
        }
        this.results(results);
    }

});