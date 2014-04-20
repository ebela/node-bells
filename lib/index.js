var _ = require('underscore');
var moment = require('moment');

module.exports = function(bellScheduleRepresentation) {
	var _bells = bellScheduleRepresentation;
	if (!_bells || !_bells.periods) return null;
	if (!_bells.other) _bells.other = [];

	var Bells = {
		// _periodsByEndTime: _.chain(Bells._schedule.periods).last(),
		_schedule: _bells,

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
			}) || null;

			return retVal;
		},

		nextBell: function(now) {

		},
	};

	return Bells;
}

_.bellsFindKey = function(obj, predicate, context) {
	var result;
	_.some(obj, function(value, index, list) {
		if (predicate.call(context, value, index, list)) {
			result = index;
			return true;
		}
	});
	return result;
};
