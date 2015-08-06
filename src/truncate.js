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
 * @param {string} [ellipses] The string to use as an ellipses. Default: '...'
 */
 angular.module('ts.utils').filter('truncate', function() {
  return function(value, wordLimit = 50, ellipses = '...'){
    if (!value)
      return value;

    var words = value.split(' ');

    if (words.length > wordLimit) {
      value = words.slice(0, wordLimit).join(' ');

      if (ellipses)
        value += ellipses;
    }

    return value;
  }
});
