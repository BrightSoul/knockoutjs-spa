define(['vendor/knockout', 'vendor/route', 'services/singleton', 'services/bus'], function(ko, router, singleton, bus) {
    
    var _routes = {};
    var _currentComponent = ko.observable(null);
    var _navigationStack = ko.observableArray([]);
    var _pendingDelete = ko.observable(false);
    var _autoNavigation = [];
    var _defaultComponent = null;
    var _regexp = { 
        optionalParameters: new RegExp(':\\?[a-zA-Z0-9]+', 'g'),
        extraSlashes: new RegExp('\/{2,}', 'g'),
        finalSlash: new RegExp('\/$', 'g'),
        defaultRoute: new RegExp('^\\#?\\/?$', 'g') 
    };

    function Navigator() {
        this.currentComponent = ko.pureComputed(function() {
            return _currentComponent();
        });
        this.defaultComponent = ko.pureComputed(function() {
            return _defaultComponent;
        });
        this.navigationStack = ko.pureComputed(function() {
            return _navigationStack();
        });
        this.canGoBack = ko.pureComputed(function() {
            return _navigationStack().length > 1 && !_pendingDelete();
        });
        this.route = function (path, component, parentPath) {
            var normalizedPaths = getNormalizedPaths(path);
            if (component in _routes) {
                console.error("Component '" + component + "' has already been added");
                return;
            }
            for (var i = 0; i < normalizedPaths.length; i++) {
                registerPath(component, path, normalizedPaths[i]);
            }
            return this;
        }.bind(this);

        this.route404 = function (component) {
            this.route(component, component);
            router('/..', function() {
                var url = window.location.pathname + window.location.hash;
                if (_regexp.defaultRoute.test(url)) {
                    manageStack(_defaultComponent);
                } else {
                    console.warn("Route '" + url + "' not found");
                    manageStack(component, { url: url });
                }
            }.bind(this));
            return this;
        }.bind(this);

        this.start = (function(defaultComponent) {
            _defaultComponent = defaultComponent;
            router.start(true);
        }).bind(this);

        this.push = function(component, params, replace) {
            var componentObject = getComponentObject(component, params);
            navigate(componentObject, replace);
        };
        this.pop = function() {
            if (!this.canGoBack()) {
                console.warn("Cannot go back now");
                return;
            }
            history.back();
        }.bind(this);
        this.popToRoot = function(componentName, params) {
            var backSteps = _navigationStack().length-1;
            if (backSteps <= 0 && !componentName) {
                console.warn("Cannot pop to root now");
                return;
            }
            if (componentName) {
                var replacePath = componentName in _routes ? _routes[componentName].path : componentName;
                replacePath = makePath(replacePath, params);
                if (backSteps > 0) {
                    var autoNavigationEntry = {
                        path: replacePath,
                        componentName: componentName,
                        replace: true
                    };
                    _autoNavigation.push(autoNavigationEntry);
                } else {
                    _navigationStack.removeAll();
                    router(replacePath, replacePath, true);
                }
            }
            if (backSteps > 0) {
                history.go(-backSteps);
            }
        }.bind(this);
    }
    return singleton.create(Navigator);

    function registerPath(component, path, normalizedPath) {
        _routes[component] = {
            path: path,
            normalizedPath: normalizedPath.path,
            parameterDefinitions: normalizedPath.parameterDefinitions
        };
        router(normalizedPath.path, getRouteCallback(component, normalizedPath.parameterDefinitions));
    }

    function manageStack(component, params) {
        var componentObject = getComponentObject(component, params);
        var index = stackIndexOf(componentObject);
        var stack = _navigationStack();
        if (index < 0) {
            //If the stack's empty, it might be a deep link request
            //in that case, we need to re-add previous pages
            _autoNavigation = [];
            if (stack.length == 0) {
                var componentName = componentObject.name;
                do {
                    var path = _routes[componentName].path;
                    var autoNavigationEntry = {
                        path: makePath(path, params),
                        componentName: componentName,
                        replace: false
                    };
                    componentName = getParentComponentName(path);
                    _autoNavigation.unshift(autoNavigationEntry);
                    
                    if (componentName) {
                        componentObject = getComponentObject(componentName, params);
                    }
                } while(componentName);
            }
            if (_autoNavigation.length > 1) {
                var autoNavigationEntry = _autoNavigation.shift();
                router(autoNavigationEntry.path, autoNavigationEntry.path, true);
            } else {
                //Regular push of a component
                _autoNavigation = [];
                //if it's the same component, just don't push, it will handle the update itself
                if (!stack.length || (componentObject.name != stack[stack.length-1].name)) {
                    _navigationStack.push(componentObject);
                }
                notifyNavigated(component, params);
            }
        } else {
            //Clicked backward
            if (_autoNavigation.length) {
                _navigationStack.RemoveAll();
                var autoNavigationEntry = _autoNavigation.shift();
                router(autoNavigationEntry.path, autoNavigationEntry.path, true);
            } else {
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
                notifyNavigated(component, params);
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

    function navigate(componentObject, replace) {
        var path;
        if (componentObject.name in _routes) {
            path = _routes[componentObject.name].path;
            var params = componentObject.params || {};
            path = makePath(path, params);
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
        while (parts.length) {
            parts.pop();
            var parentPath = parts.join('/') || '/';
            for (var componentName in _routes) {
                if (_routes[componentName].path == parentPath) {
                    return componentName;
                }
            }
        }
        return null;
    }

    function notifyNavigated(component, params) {
        bus.send('navigated', { componentName: component, params: params });
    }

    //TODO: remove this?
    function setCurrentComponent(component, params) {
        params = params || {};
        _currentComponent(getComponentObject(component, params));
    }

    function getComponentObject(component, params) {
        params = params || {};
        params.componentName = component;
        return {name: component, params: params, pendingDelete: ko.observable(false) };
    }

    function getNormalizedPaths(path) {
        var normalizedPaths = [];
        var regex = /\:\??[a-zA-Z0-9]+/g;
        var matches = path.match(regex);
        var parameterDefinitions = [];
        if (matches) {
            parameterDefinitions = matches.map(function(p) {
                var isOptional = p.substr(0, 2) == ":?";
                return {
                    name: p.substr(isOptional ? 2 : 1),
                    isOptional: isOptional
                };
            });
        }
        var isLastParameterOptional;
        do {
            normalizedPaths.push({
                path: path.replace(regex, '*'),
                parameterDefinitions: parameterDefinitions
            });
            isLastParameterOptional = parameterDefinitions.length && parameterDefinitions[parameterDefinitions.length-1].isOptional;
            if (isLastParameterOptional) {
                path = path.substr(0, path.lastIndexOf('/'));
                parameterDefinitions = parameterDefinitions.slice(0, parameterDefinitions.length-1);
            }
        } while(isLastParameterOptional);

        return normalizedPaths;
    }

    function makePath(path, params) {
        if (!path) {
            return path;
        }
        for (var param in params) {
            var regex = new RegExp(':\\??' + param + '(?![a-zA-Z0-9])')
            path = path.replace(regex, params[param]);
        }
        //Fix path and return
        path = path
                .replace(_regexp.optionalParameters, '')
                .replace(_regexp.extraSlashes, '/')
                .replace(_regexp.finalSlash, '') || '/';
        return path;
    }

    function getRouteCallback(component, parameterDefinitions) {
        return function () {
            var params = {};
            if (parameterDefinitions) {
                for (var i = 0; i < parameterDefinitions.length; i++) {
                    params[parameterDefinitions[i].name] = i < arguments.length ? arguments[i] : null;
                }
            }
            if (_autoNavigation.length) {
                var autoNavigationEntry = _autoNavigation.shift();
                if (autoNavigationEntry.replace) {
                    _navigationStack.removeAll();
                    router(autoNavigationEntry.path, autoNavigationEntry.path, true);
                } else {
                    _navigationStack.push(getComponentObject(component, params));
                    setTimeout(function() {
                        router(autoNavigationEntry.path, autoNavigationEntry.path, false);
                    }, 1);
                }
            } else {
                //TODO: remove this?
                setCurrentComponent(component, params);
                manageStack(component, params);
            }
        };
    }

});