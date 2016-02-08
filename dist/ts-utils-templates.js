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
