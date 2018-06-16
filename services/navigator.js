define(['vendor/knockout', 'vendor/route', 'services/singleton'], function(ko, router, singleton) {
    
    var _routes = {};
    var _currentComponent = ko.observable(null);
    var _navigationStack = ko.observableArray([]);
    var _pendingDelete = ko.observable(false);
    var _autoNavigation = [];

    function Navigator() {
        this.currentComponent = ko.pureComputed(function() {
            return _currentComponent();
        });
        this.navigationStack = ko.pureComputed(function() {
            return _navigationStack();
        });
        this.canGoBack = ko.pureComputed(function() {
            return _navigationStack().length > 1 && !_pendingDelete();
        });
        this.route = function (path, component, parentPath) {
            var normalizedPath = getNormalizedPath(path);
            if (component in _routes) {
                console.error("Component '" + component + "' has already been added");
                return;
            }
            _routes[component] = {
                path: path,
                normalizedPath: normalizedPath.path,
                parameterNames: normalizedPath.parameterNames
            };
            router(normalizedPath.path, getRouteCallback(component, normalizedPath.parameterNames));
            return this;
        }.bind(this);

        this.route404 = function (component) {
            this.route(component, component);
            router('/..', function() {
                var url = window.location.pathname + window.location.hash;
                console.warn("Route '" + url + "' not found");
                manageStack(component, { url: url });
            }.bind(this));
            return this;
        }.bind(this);

        this.start = (function() {
            router.start(true);
        }).bind(this);

        this.push = function(component, params, substack, replace) {
            var componentObject = getComponentObject(component, params);
            navigate(componentObject, substack, replace);
        };
        this.pop = function() {
            if (!this.canGoBack()) {
                console.warn("Cannot go back now");
                return;
            }
            history.back();
        }.bind(this);
        this.popToRoot = function() {
            if (!this.canGoBack()) {
                console.warn("Cannot pop to root now");
                return;
            }
            history.go(-(_navigationStack().length-1));
        }.bind(this);
    }
    return singleton.create(Navigator);

    function manageStack(component, params) {
        var componentObject = getComponentObject(component, params);
        var index = stackIndexOf(componentObject);
        if (index < 0) {
            //If the stack's empty, it might be a deep link request
            //in that case, we need to re-add previous pages
            _autoNavigation = [];
            if (_navigationStack().length == 0) {
                var componentName = componentObject.name;
                do {
                    var path = _routes[componentName].path;
                    var autoNavigationEntry = {
                        path: makePath(path, params),
                        componentName: componentName
                    };
                    componentName = getParentComponentName(path);
                    _autoNavigation.unshift(autoNavigationEntry);
                    
                    if (componentName) {
                        componentObject = getComponentObject(componentName, params);
                    }
                } while(componentName);
            }
            if (_autoNavigation.length > 1) {
                //alert(1);
                var autoNavigationEntry = _autoNavigation.shift();
                //_navigationStack.push(getComponentObject(autoNavigationEntry.componentName, params));
                router(autoNavigationEntry.path, autoNavigationEntry.path, true);
            } else {
                //Regular push of a component
                _autoNavigation = [];
                _navigationStack.push(componentObject);
            }
        } else {
            //Clicked backward
            var stack = _navigationStack();
            for (var i = stack.length-1; i > index; i--) {
                if (i == stack.length-1) {
                    _pendingDelete(true);
                    stack[i].pendingDelete(true);
                    setTimeout(function() { 
                        _navigationStack.pop();
                        _pendingDelete(false);
                    }, 1000);
                } else {
                    _navigationStack.remove(stack[i]);
                }
            }
        }
    }

    function stackIndexOf(componentObject) {
        var index = -1;
        var stack = _navigationStack();
        for (var i = stack.length - 1; i >= 0; i --) {
            if (stack[i].name != componentObject.name) {
                continue;
            }
            if (JSON.stringify(stack[i].params) != JSON.stringify(componentObject.params)) {
                continue;
            }
            index = i;
            break;
        }
        return index;
    }

    function navigate(componentObject, substack, replace) {
        var path;
        if (componentObject.name in _routes) {
            path = _routes[componentObject.name].path;
            var parameters = componentObject.params || {};
            for (var parameter in parameters) {
                path = path.replace(":" + parameter, parameters[parameter]);
            }
        } else {
            console.warn("Component '" + componentObject.name + "' not found in routes");
            path = componentObject.name;
        }
        router(path, path, replace);
    }

    function getParentComponentName(path) {
        path = path || '/';
        var parts = path.split('/');
        while(parts.length > 0 && parts[parts.length-1] == "") {
            parts.pop();
        }
        if (!parts.length) {
            return null;
        }
        //Remove last part
        if (parts.length > 0) {
            parts.pop();
        }
        var parentPath = parts.join('/') || '/';
        for (var componentName in _routes) {
            if (_routes[componentName].path == parentPath) {
                return componentName;
            }
        }
        return null;
    }

    //TODO: remove this?
    function setCurrentComponent(component, params) {
        params = params || {};
        _currentComponent(getComponentObject(component, params));
    }

    function getComponentObject(component, params) {
        return {name: component, params: params, pendingDelete: ko.observable(false) };
    }

    function getNormalizedPath(path) {
        var regex = /\:[a-zA-Z0-9]+/g;
        var matches = path.match(regex);
        var parameterNames = [];
        if (matches) {
            parameterNames = matches.map(function(p) { return p.substr(1); });
        }
        path = path.replace(regex, '*');
        return {
            path: path,
            parameterNames: parameterNames
        };
    }

    function makePath(path, params) {
        if (!path) {
            return path;
        }
        for (var param in params) {
            var regex = new RegExp(':' + param + '(?![a-zA-Z0-9])')
            path = path.replace(regex, params[param]);
        }
        return path;
    }

    function getRouteCallback(component, parameterNames) {
        return function () {
            console.log("in");
            var params = {};
            if (parameterNames) {
                for (var i = 0; i < parameterNames.length; i++) {
                    params[parameterNames[i]] = arguments[i];
                }
            }
            if (_autoNavigation.length) {
                _navigationStack.push(getComponentObject(component, params));
                var autoNavigationEntry = _autoNavigation.shift();
                setTimeout(function() {
                    router(autoNavigationEntry.path, autoNavigationEntry.path, false);
                }, 1);
            } else {
                //TODO: togli qui
                setCurrentComponent(component, params);
                manageStack(component, params);
            }
        };
    }

});