define(['vendor/knockout', 'vendor/route', 'services/singleton'], function(ko, router, singleton) {
    
    var _routes = {};
    var _currentComponent = ko.observable(null);
    var _initialComponent = null;
    var _navigationStack = ko.observableArray([]);

    function Navigator() {
        this.currentComponent = ko.pureComputed(function() {
            return _currentComponent();
        });
        this.navigationStack = ko.pureComputed(function() {
            return _navigationStack();
        });
        this.canGoBack = ko.pureComputed(function() {
            return _navigationStack().length > 1;
        });
        this.route = (function (path, component, parentPath) {
            parentPath = parentPath || getParentPath(path);
            var normalizedPath = getNormalizedPath(path);
            if (component in _routes) {
                console.error("Component '" + component + "' has already been added");
                return;
            }
            _routes[component] = {
                path: path,
                normalizedPath: normalizedPath.path,
                parameterNames: normalizedPath.parameterNames,
                parentPath: parentPath
            };
            router(normalizedPath.path, getRouteCallback(component, normalizedPath.parameterNames));
            return this;
        }).bind(this);

        this.route404 = (function (component) {
            router('/..', function() {
                console.warn("Route not found");
                setCurrentComponent(component);
            });
            return this;
        }).bind(this);

        this.start = (function(initialComponent) {
            if (!initialComponent) {
                console.error("No value provided for the initial component, navigator cannot start.");
                return;
            }
            _initialComponent = initialComponent;
            //router.base('/');
            router.start(true);
            this.push(initialComponent);
        }).bind(this);

        this.push = function(component, params) {
            var componentObject = getComponentObject(component, params);
            navigate(componentObject);
        };
        this.pop = (function() {
            if (!this.canGoBack()) {
                console.warn("Cannot go back");
                return;
            }
            history.back();
        }).bind(this);
        this.popToRoot = function() {
            if (!this.canGoBack()) {
                console.warn("Cannot pop to root");
                return;
            }
            history.go(-(_navigationStack().length-1));
        };
    }
    return singleton.create(Navigator);

    function manageStack(component, params) {
        var componentObject = getComponentObject(component, params);
        var index = stackIndexOf(componentObject);
        if (index < 0) {
            _navigationStack.push(componentObject);
        } else {
            //Clicked backward
            //TODO: pending delete
            for (var i = _navigationStack().length-1; i > index; i--) {
                _navigationStack.pop();
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

    function navigate(componentObject) {
        if (!(componentObject.name in _routes)) {
            console.error("Component '" + componentObject.name + "' not found in routes");
        }
        var path = _routes[componentObject.name].path;
        var parameters = componentObject.params || {};
        for (var parameter in parameters) {
            path = path.replace(":" + parameter, parameters[parameter]);
        }
        router(path);
    }
    function getParentPath(path) {
        path = path || '/';
        var parts = path.split('/');
        while(parts.length > 0 && parts[parts.length-1] == "") {
            parts.pop();
        }
        //Remove last part
        if (parts.length > 0) {
            parts.pop();
        }
        return parts.join('/') || '/';
    }

    function setCurrentComponent(component, params) {
        params = params || {};
        _currentComponent(getComponentObject(component, params));
    }

    function getComponentObject(component, params) {
        return {name: component, params: params };
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

    function getRouteCallback(component, parameterNames) {
        return function () {
            var params = {};
            if (parameterNames) {
                for (var i = 0; i < parameterNames.length; i++) {
                    params[parameterNames[i]] = arguments[i];
                }
            }
            setCurrentComponent(component, params);
            manageStack(component, params);
        };
    }

});