'use strict';

angular.module('ts.utils', []);
/**
 * @TODO remove in liue of ui-utils
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
'use strict';

angular.module('ts.utils').directive('uiEvent', function ($parse) {
    return {
        priority: 100,
        link: function link($scope, $elm, $attrs) {
            var events = $scope.$eval($attrs.uiEvent);
            angular.forEach(events, function (uiEvent, eventName) {
                var fn = $parse(uiEvent);
                $elm.bind(eventName, function (evt) {
                    var params = Array.prototype.slice.call(arguments);
                    //Take out first paramater (event object);
                    params = params.splice(1);
                    fn($scope, { $event: evt, $params: params });
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        }
    };
});
/**
 * truncate - Truncates a string by a specified number of words
 *
 * @example
 * 	<p>
 * 		{{::post.body | truncate : 35}}
 * 		<a ng-if="::post.body.split(' ').length>35">Read More</a>
 * 	</p>
 *
 * @param {string} value  The string to be truncated
 * @param {int} [wordLimit] The number of words to truncate at. Default: 50
 * @param {string} [ellipses] The string to use as an ellipses. Default: '…' (&hellip;)
 */
'use strict';

angular.module('ts.utils').filter('ts-truncate', function () {
  return function (value) {
    var wordLimit = arguments.length <= 1 || arguments[1] === undefined ? 50 : arguments[1];
    var ellipses = arguments.length <= 2 || arguments[2] === undefined ? '…' : arguments[2];

    if (!value) return value;

    var words = value.split(' ');

    if (words.length > wordLimit) {
      value = words.slice(0, wordLimit).join(' ');

      if (ellipses) value += ellipses;
    }

    return value;
  };
});

/**
 * scrollOn - $broadcast()/$emit() a $scope event with the location to trigger scrolling
 *
 * @example
 *   <ul scroll-on="someEventName" style="overflow: auto">...</ul>
 *   ...
 *   var location = 'bottom';
 *   $scope.$broadcast('someEventName', location)
 *
 * @param location {'top'|'bottom'|offset} must be passed as event data
 */
'use strict';

angular.module('ts.utils').directive('scrollOn', function ($timeout) {
  return {
    link: {
      pre: function pre($scope, $element, $attrs) {
        $scope.$on($attrs.scrollOn, function (event, location) {
          // let updates render
          $timeout(function () {
            if (location === 'bottom') {
              $element[0].scrollTop = $element[0].scrollHeight;
            } else if (location === 'top') {
              $element[0].scrollTop = 0;
            } else {
              $element[0].scrollTop = location;
            }
          }, true);
        });
      }
    }
  };
});
/**
 * Paginator
 *
 * Simple paginator utility example that abstracts logic in a controllable pattern
 *
 * @TODO make paginator only lookup missing related data
 *
 * @param paginate {function} Query function that takes paginationOptions
 *
 * @example
 *   resolve: {
 *     // Prepares the paginator
 *     paginator: function(Paginator, Project) {
 *       // Calls `Project.list(paginationOptions)`
 *       return new Paginator(Project.list, { limit: 50 });
 *     },
 *     // Queries the initial load
 *     projects: function(paginator) {
 *       return paginator.next();
 *     }
 *   }
 *
 * @example
 *   resolve: {
 *     taskPaginator: function(Paginator, Task, $stateParams) {
 *       return new Paginator( (paginationOptions) => Task.list($stateParams.projectId, paginationOptions) );
 *       // or
 *       return new Paginator( Task.list, { projectId: $stateParams.projectId } );
 *     },
 *     tasks: function(taskPaginator) {
 *       return taskPaginator.next();
 *     }
 *   }
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

angular.module('ts.utils').factory('Paginator', function ($http, $q) {
  var Paginator = (function () {
    /**
     * @param  {string|function} paginate URL or callback function that returns
     *                                    a promise
     * @param  {object} options Default paginate query options
     * @param  {object} relatedHelpers Map of callback functions that take array
     *                                 of items and returns an indexed hash
     */

    function Paginator(paginate) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var relatedHelpers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      _classCallCheck(this, Paginator);

      this.resetOptions = options;
      this.paginate = paginate;
      this.relatedHelpers = relatedHelpers;
      this.related = _.mapValues(this.relatedHelpers, function () {
        return {};
      });
    }

    /**
     * paginator.paginate - paginator function
     *
     * @param  {url|function} paginate
     *   If a url is provided, a wrapper for $http.get() is created
     *   If a callback is provided, use that instead
     */

    _createClass(Paginator, [{
      key: 'reset',

      /**
       * reset()
       *
       * Clear items collection. Useful for preserving related data.
       *
       * @note If you want a hard reset of all related data, create a new Paginator
       *
       * @param {object} [resetOptions]
       *   Optional hash of options to reset with,
       *   otherwise last reset options will be used
       */
      value: function reset() {
        var resetOptions = arguments.length <= 0 || arguments[0] === undefined ? this.resetOptions : arguments[0];

        this.resetOptions = resetOptions;
        this.options = _.extend({
          limit: 40,
          offset: 0,
          page: 0
        }, resetOptions);
        this.hasMore = true;
        this.items = [];
        return this;
      }

      /**
       * add()
       *
       * Add item to this.items and populate related
       *
       * @param  {index|object} item Reference to an object or the index
       */
    }, {
      key: 'add',
      value: function add(item) {
        this.items.unshift(item);
        return this.getRelated([item]);
      }

      /**
       * remove()
       *
       * Remove item from items
       *
       * @param  {index|object} item Reference to an object or the index
       */
    }, {
      key: 'remove',
      value: function remove(item) {
        if (!this.items[item]) item = this.items.indexOf(item);

        if (~item) this.items.splice(item, 1);
      }

      /**
       * next()
       *
       * Sets `paginator.loading` to true while querying
       *
       * @return {Function} [description]
       */
    }, {
      key: 'next',
      value: function next() {
        var _this = this;

        if (!this.hasMore) return $q.when(this.items);
        if (this.loading) return this.loading;

        return this.loading = this.paginate(this.options).then(function (items) {
          if (!items.length) _this.hasMore = false;

          _this.items = _this.items.concat(items.reverse());

          // @TODO remove shitty hack for bugs with backend giving duplicates
          _this.items = _.uniq(_this.items, 'uuid');

          _this.options.page++;
          _this.options.offset = _this.options.page * _this.options.limit;
          return _this.getRelated(items);
        }).then(function (related) {
          return _this.items;
        })['finally'](function () {
          return _this.loading = null;
        });;
      }

      /**
       * getRelated(newItems)
       *
       * Iterates over related data retrieval helpers
       * When each helper resolves with a hash of relatedItems, they are merged onto
       * the paginator's existing cache of related items.
       *
       * @example
       *   paginator = new Paginator(Project.list(), {}, { owners: Project.relatedOwners });
       *   paginator.next();
       *
       *   <li ng-repeat="project in paginator.projects">
       *     {{paginator.related.owners[project.owner_id].name}}
       *   </li>
       *
       * @param  {array} [items] an array of objects to pass to the related helper
       * @return {Promise}       resolved when all helpers are done
       */
    }, {
      key: 'getRelated',
      value: function getRelated() {
        var _this2 = this;

        var items = arguments.length <= 0 || arguments[0] === undefined ? this.items : arguments[0];

        return $q.all(_.mapValues(this.relatedHelpers, function (helper, name) {
          return helper(items).then(function (relatedItems) {
            return _.extend(_this2.related[name], relatedItems);
          });
        }));
      }
    }, {
      key: 'paginate',
      set: function set(paginate) {
        this.reset();
        if (angular.isString(paginate)) this._paginate = function (paginateOptions) {
          return $http.get(paginate, { params: paginateOptions });
        };else this._paginate = paginate;
      },
      get: function get() {
        return this._paginate;
      }
    }]);

    return Paginator;
  })();

  return Paginator;
});
/**
 * focusOn - Focuses an input on scope event
 *
 * @example
 *   <input focus-on="someEventName">
 *   or
 *   <input focus-on="focus-row-{{$index}}">
 *   ...
 *   $scope.$broadcast('someEventName')
 *
 */
'use strict';

angular.module('ts.utils').directive('focusOn', function () {
  return {
    link: function link($scope, $element, $attrs) {
      var listener = angular.noop;
      $attrs.$observe('focusOn', function (newVal) {
        // Stop listening to old event name
        listener();
        // Listen to new event name
        listener = $scope.$on(newVal, function () {
          $element[0].focus();
        });
      });
    }
  };
});
/**
 * autoGrow - Increases height of textarea while typing
 *
 * @note use with min-height, max-height and box-sizing:border-box
 *
 * @example
 * 	<textarea auto-grow></textarea>
 */
'use strict';

angular.module('ts.utils').directive('autoGrow', function ($timeout) {
  return {
    restrict: 'A',
    link: function link($scope, $element, $attrs) {
      function grow() {
        $element[0].style.height = 0; // autoshrink - need accurate scrollHeight
        $element[0].style.height = $element[0].scrollHeight + 'px';
      }
      $element.on('input', grow);
      $timeout(grow, true);
    }
  };
});
//# sourceMappingURL=utils.js.map