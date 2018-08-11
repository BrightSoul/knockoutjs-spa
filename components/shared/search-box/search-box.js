define(['vendor/knockout', 'services/navigator'], function(ko, navigator) {

    return function SearchBoxViewModel(params) {
        this.query = ko.observable("");
        this.query.subscribe(performSearch.bind(this));
        this.results = ko.observableArray([]);
        this.hasFocus = ko.observable(true);
        this.closeSearch = function() {
            this.hasFocus(false);
            this.query("");
            params.closeCommand();
        }.bind(this);
        this.hasResults = ko.pureComputed(function() {
            return this.results().length > 0;
        }.bind(this));
        this.selectResult = function(result) {
            alert("Result selected");
            this.hasFocus(false);
            this.closeSearch();
        }.bind(this);
    };

    function performSearch(query) {
        var results = [];
        if (query) {
        
            for (var i = 0; i < Math.max(0, 10-query.length); i++) {
                results.push({text: "Result " + i });
            }
        }
        this.results(results);
    }

});