var should = require('should');
var assert = require('assert');
var Bells = require('../lib');
var moment = require('moment');

var normalBellScheduleRepresentation = {
	periods: {
		'1': ['7:33', '8:23'], // [start-time, end-time]
		'2': ['8:29', '9:24'], // Where time between 00:00 and 23:59
		'3': ['9:30', '10:20'],
		'4 (1st lunch)': ['10:26', '11:16'],
		'5 (2nd lunch)': ['11:22', '12:12'],
		'6 (3rd lunch)': ['12:18', '13:08'],
		'7': ['13:14', '14:04'],
		'8': ['14:10', '15:00'],
	},
	other: [
		'7:15',
		'7:25',
	],
};
var criteria = {
	// 'none' is interpreted to mean there is no school.
	// [0, 6] means that this applies on those days of the week, where
	//	 0 is Sunday and 6 is Saturday.
	'none': [0, 6],

	// 'default' is the fallback bell schedule.
	// There can only be one default.
	'Normal Day': 'default',

	// This applies when the day equals 1 (Monday).
	// A specific day of the week gets higher priority than 'default', but lower
	//	 than a specific date.
	'Monday': 1,

	// This applies on 4/14/14 and 4/17/14.
	// A specific date overrides any day-of-week selector or the 'default'.
	'FCAT': ['4/17/2014', '4/22/2014', '4/23/2014'],

	// You can also specify a string with a date instead of an array of strings
	'FCAT - Monday': '4/14/2014',
};

describe('Bells', function() {
	describe('#constructor(bellScheduleRepresentation)', function() {
		it('should return an object for a valid input', function() {
			Bells(normalBellScheduleRepresentation).should.be.ok.and.be.an.Object;
		});

		it('should return null for invalid input', function() {
			assert.equal(Bells({}), null);
			assert.equal(Bells(42), null);
			assert.equal(Bells('Normal Day'), null);
			assert.equal(Bells(), null);
		})

		it('should have the correct functions', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);
			normalBellSchedule.currentPeriod.should.be.a.Function;
			normalBellSchedule.nextBell.should.be.a.Function;
		});
	});

	describe('#currentPeriod([now])', function() {
		it('should return the correct period when the period name is nonnumeric', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);
			normalBellSchedule.currentPeriod('13:00').should.be.a.String.and.eql('6 (3rd lunch)');
		});

		it('should return the correct period when the period name is numeric', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);
			normalBellSchedule.currentPeriod('14:15').should.be.a.String.and.eql('8');
		});

		it('should return null when not in a period', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);
			assert.equal(normalBellSchedule.currentPeriod('16:00'), null);
		});
	});

	describe('#nextBell([now])', function() {
		it('should return the time of the next arbitrary bell when appropriate', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);

			// == 7:15
			normalBellSchedule.nextBell('7:10').should.match(function(obj) {
				return moment.isMoment(obj);
			}).and.match(function(obj) {
				var clone = moment(obj);
				expected.hour(7);
				expected.minute(15);
				return obj.isSame(expected);
			});
		});

		it('should return the next end-of-class bell when appropriate', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);

			// == 8:23
			normalBellSchedule.nextBell('8:00').should.match(function(obj) {
				return moment.isMoment(obj);
			}).and.match(function(obj) {
				var clone = moment(obj);
				expected.hour(8);
				expected.minute(23);
				return obj.isSame(expected);
			});
		});

		it('should return the next tardy bell when appropriate', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);

			// == 8:29
			normalBellSchedule.nextBell('8:24').should.match(function(obj) {
				return moment.isMoment(obj);
			}).and.match(function(obj) {
				var clone = moment(obj);
				expected.hour(8);
				expected.minute(29);
				return obj.isSame(expected);
			});
		});

		it('should return the next bell when given the same time as a bell', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);

			// == 8:29
			normalBellSchedule.nextBell('8:23').should.match(function(obj) {
				return moment.isMoment(obj);
			}).and.match(function(obj) {
				var clone = moment(obj);
				expected.hour(8);
				expected.minute(29);
				return obj.isSame(expected);
			});
		});

		it('should return null when there are no more bells', function() {
			var normalBellSchedule = Bells(normalBellScheduleRepresentation);
			assert.equal(normalBellSchedule.nextBell('16:00'), null);
		});
	});
});

describe('Bells.Predictor', function() {
	it('should exist', function() {
		Bells.Predictor.should.be.ok.and.be.a.Function;
	});

	describe('#constructor(criteria)', function() {
		it('should return an object for a valid input', function() {
			Bells.Predictor(criteria).should.be.ok.and.be.an.Object;
		});

		it('should return null for invalid input', function() {
			assert.equal(Bells.Predictor({}), null);
			assert.equal(Bells.Predictor(42), null);
			assert.equal(Bells.Predictor('Normal Day'), null);
			assert.equal(Bells.Predictor(), null);
		})

		it('should have the correct functions', function() {
			var Predictor = Bells.Predictor(criteria);
			Predictor.predict.should.be.a.Function;
		});
	});

	describe('#predict([date])', function() {
		it('should correctly predict default bell schedules', function() {
			var Predictor = Bells.Predictor(criteria);
			Predictor.predict('2014-04-15').should.be.a.String.and.eql('Normal Day');
		});

		it('should correctly predict day-of-week bell schedules', function() {
			var Predictor = Bells.Predictor(criteria);
			Predictor.predict('2014-04-21').should.be.a.String.and.eql('Monday');
		});

		it('should correctly predict date-specific bell schedules', function() {
			var Predictor = Bells.Predictor(criteria);
			Predictor.predict('2014-04-14').should.be.a.String.and.eql('FCAT - Monday');
		});

		it('should correctly predict no school', function() {
			var Predictor = Bells.Predictor(criteria);
			Predictor.predict('2014-04-19').should.be.a.String.and.eql('none');
		});

		it('should return null for an invalid input', function() {
			var Predictor = Bells.Predictor(criteria);
			assert.equal(Predictor.predict(''), null);
			assert.equal(Predictor.predict(), null);
			assert.equal(Predictor.predict('gibberish'), null);
			assert.equal(Predictor.predict('2014-04'), null);
			assert.equal(Predictor.predict('2014-19'), null);
			assert.equal(Predictor.predict(42), null);
		})
	});
});
