var _ = require('underscore');
var moment = require('moment');

module.exports = function(bellScheduleRepresentation) {
	var _bells = bellScheduleRepresentation;
	if (!_bells || !_.isObject(_bells)) return null;
	if (!_bells.periods || !_.isObject(_bells.periods)) return null;
	if (!_bells.other) _bells.other = [];

	var Bells = {
		_schedule: _bells,

		// sort(union(other, flatten(values(periods))))
		_allBells: _.chain(_bells.periods)
					.values()
					.flatten()
					.union(_bells.other)
					.sortBy(function(time) {
						return moment(time, 'HH:mm').unix();
					})
					.value(),

		currentPeriod: function(now) {
			var _today = moment();

			if (!now) now = _today;
			else {
				now = moment(now, 'HH:mm');
				now.year(_today.year());
				now.month(_today.month());
				now.day(_today.day());
			}

			var retVal = _.bellsFindKey(_bells.periods, function(item) {
				if (!_.isArray(item) || item.length != 2) return false;

				var startTime = moment(item[0], 'HH:mm');
				var endTime = moment(item[1], 'HH:mm');

				if (!startTime.isValid() || !endTime.isValid()) return false;

				if (startTime.isBefore(now, 'minute') && endTime.isAfter(now, 'minute')) return true;
				if (startTime.isSame(now, 'minute')) return true;

				return false;
			});

			// retVal is separate for debugging purposes
			return retVal;
		},

		nextBell: function(now) {
			var _today = moment();

			if (!now) now = _today;
			else {
				now = moment(now, 'HH:mm');
				now.year(_today.year());
				now.month(_today.month());
				now.day(_today.day());
			}

			var retVal = _.find(Bells._allBells, function(bell) {
				return now.isBefore(moment(bell, 'HH:mm'));
			});

			// retVal is separate for debugging purposes
			return retVal;
		},

		periods: function() {
			return _bells.periods;
		},
		allBells: function() {
			return Bells._allBells;
		},
	};

	return Bells;
};

module.exports.Predictor = function(criteria) {
	if (!criteria || !_.isObject(criteria) || _.keys(criteria).length == 0) return null;

	var Predictor = {
		_criteria: criteria,

		// The name of the default bell schedule
		_default: criteria['default'] || 'none',

		// {pattern: schedule} for all day-of-week matchers
		_dow: _.contribPickWhen(criteria, function(schedule, pattern) {
			return !_.isNaN(parseInt(pattern, 10));
		}),
		// {pattern: schedule} for all date matchers
		_date: _.contribPickWhen(criteria, function(schedule, pattern) {
			return moment(pattern, 'MM/DD/YYYY').isValid();
		}),

		predict: function(now) {
			var _today = moment();
			if (!now) now = _today;
			else now = moment(now);
			if (!now.isValid()) return null;
			var formattedNow = now.format('MM/DD/YYYY');
			var dow = now.day().toString(10);

			return criteria[formattedNow] || criteria[dow] || criteria.default || 'none';
		},
	};

	return Predictor;
};

_.mixin({
	bellsFindKey: function(obj, predicate, context) {
		var result = null;
		_.some(obj, function(value, index, list) {
			if (predicate.call(context, value, index, list)) {
				result = index;
				return true;
			}
		});
		return result;
	},

	// Taken from underscore-contrib (https://github.com/documentcloud/underscore-contrib/blob/master/underscore.object.selectors.js)
	// 	which is under the MIT license
	contribPickWhen: function(obj, pred) {
		var copy = {};

		_.each(obj, function(value, key) {
			if (pred(obj[key], key)) copy[key] = obj[key];
		});

		return copy;
	}
});
