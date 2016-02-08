# ts-utils
A package of open-sourceable angularjs utils

## Installation

0. `bower install townsquared/utils`
0. load the `utils.js`
0. `angular.module('myApp', ['ts.utils'])`

## Utils

### autoGrow

Increases height of textarea while typing

**Note:** use with `min-height`, `max-height` and `box-sizing: border-box`

```html
<textarea auto-grow></textarea>
```

### focusOn

Focuses an input on scope broadcasted event.

Specify the name of the broadcast event you would like to use to trigger the focusing.

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

### scrollOn

Scroll to a certain point inside an overflowing DOM element on scope broadcasted event.

Specify the name of the broadcast event you would like to use to trigger scrolling.  
Pass the location to scroll to as the data of the event.  
**Location:** 'top' | 'bottom' | 200

 ```html
 <ul scroll-on="someEventName" style="overflow: auto">...</ul>
 ```

```js
 var location = 'bottom';
 $scope.$broadcast('someEventName', location);
 ```

### truncate

Truncates a string by a specified number of words

```html
<p>
  {{::post.body | tsTruncate : 35}}
  <a ng-if="::post.body.split(' ').length>35">Read More</a>
</p>
```

### uiEvent

**TODO:** Remove in liue of ui-utils

General-purpose Event binding. Bind any event not natively supported by Angular
Pass an object with keynames for events and their callback expressions
Allows $event object and $params object to be passed to expressions

```html
<input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
<input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
```
