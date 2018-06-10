define(['vendor/knockout'], function(ko) {
    function Singleton() {
    }
    Singleton.prototype.create = function(func) {
        if (!('appServices' in window)) {
            window.appServices = {};
        }
        if (!(func.name in window.appServices)) {
            window.appServices[func.name] = new func();
        }
        return window.appServices[func.name];
    };
    return new Singleton();
});