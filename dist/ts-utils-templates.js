(function(module) {
try {
  module = angular.module('ts.utils');
} catch (e) {
  module = angular.module('ts.utils', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/tsDropDown.html',
    '<div class="drop-down-container">\n' +
    '  <div class="selected-item-container">\n' +
    '  </div><div class="arrow-container" ng-class="{\'arrow-default\':!dropDownOpen, \'arrow-open\':dropDownOpen}">\n' +
    '  </div>\n' +
    '  <div ng-show="dropDownOpen"\n' +
    '       class="drop-down-list-container">\n' +
    '    <ul>\n' +
    '    </ul>\n' +
    '  </div>\n' +
    '</div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ts.utils');
} catch (e) {
  module = angular.module('ts.utils', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('templates/tsTooltip.html',
    '<div class="ts-tooltip-container {{::tsTooltipClass}}">\n' +
    '  <div class="arrow-box-container">\n' +
    '    <div id="tooltipMain" class="ts-tooltip-main" ng-class="{\'ts-tooltip-close\': tsTooltipShowClose}">\n' +
    '      <div class="close" ng-show="tsTooltipShowClose">\n' +
    '        <a href="#" ng-click="close()"><small><i class="icon-close icon" aria-hidden="true"></i></small></a>\n' +
    '      </div>\n' +
    '      {{tsTooltip}}\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>');
}]);
})();
