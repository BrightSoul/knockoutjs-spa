define(['vendor/knockout', 'services/singleton'], function(ko, singleton) {

    var subscriptions = {};

    function Bus() {
        this.send = function(messageName, message) {
            if (!(messageName in subscriptions)) {
                console.info("No subscribers found for message '"+messageName+"'");
                return;
            }
            var subscribers = subscriptions[messageName];
            for (var i = 0; i < subscribers.length; i++) {
                subscribers[i].callback(message);
            }
        };
        this.subscribe = function(messageName, callback) {
            if (!(messageName in subscriptions)) {
                subscriptions[messageName] = [];
            }
            var subscription = {
                messageName: messageName,
                callback: callback
            };
            subscriptions[messageName].push(subscription);
            return subscription;
        };
        this.unsubscribe = function(subscription) {
            if (!subscription || (! ('messageName' in subscription)) || (!(subscription.messageName in subscriptions))) {
                console.error("Can't unsubscribe, subscription is not valid or message name not found");
                return;
            }
            var index = subscriptions[subscription.messageName].indexOf(subscription);
            if (index < 0) {
                console.error("Can't unsubscribe, this subscription did not exist");
                return;
            }
            subscriptions.splice(index, 1);
        }
        this.logout = function() {
            storage.save("user", null);
            _user(null);
        }
    }
    return singleton.create(Bus);
});