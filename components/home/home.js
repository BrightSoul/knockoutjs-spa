define(['vendor/knockout'], function(ko) {

    return function HomeViewModel() {
        this.text = ko.observable("ciaooo");
        this.cmd1 = function() {
            alert("cmd1");
        };
        this.cmd2 = function() {
            alert("cmd2");
        }

    };
});