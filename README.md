# ts-utils
A package of open-sourceable angularjs utils

## Installation

0. `bower install townsquared/utils`
0. load the `utils.js`
0. `angular.module('myApp', ['ts.utils'])`

## Utils

### focusOn

Focuses an input on scope broadcasted event.

Specify the name of the broadcast event you would like to use to trigger the event


```html
<input focus-on="someEventName">
or
<input focus-on="focus-row-{{$index}}">
```

```js
$scope.$broadcast('someEventName');
or
$scope.$broadcast('focus-row-'+$index);
```
