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
    '  </div><div class="arrow-container">\n' +
    '    <div ng-if="!dropDownOpen" class="drop-down-arrow"><i class="fa fa-angle-down"></i></div>\n' +
    '    <div ng-if="dropDownOpen" class="drop-down-arrow"><i class="fa fa-angle-up"></i></div>\n' +
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
    '<div class="ts-tooltip-container">\n' +
    '  <div class="arrow-box-container">\n' +
    '    <div id="tooltipMain" class="ts-tooltip-main">\n' +
    '      {{tsTooltip}}\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>');
}]);
})();