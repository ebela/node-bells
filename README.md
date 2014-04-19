`bells`
=======
This is an `npm` module that helps with the computation of bell schedules.

## Install
`npm install --save bells` once it is published

## Features
- Awesomeness
- Store names for certain periods, not necessarily numerical or in order
- Get the current period
- Get when the next bell is
- Have bells not associated with a specific period
- Guess the bell schedule for a specific day based on a given set of criteria

## API
Times are passed around as instances of [`Moment()`][Moment].

When an argument is a time, `Bells` attempts to parse it as one of the formats
specified [here][Moment-ParseString]. If these fail, then it attempts to parse
it as a `HH:mm` time (24hr time).

### `Bells(bellScheduleRepresentation)`
Create a `Bells` object. See below for the layout of
`bellScheduleRepresentation`.

```js
var Bells = require('bells');

// Steinbrenner High School of Lutz, FL's normal bell schedule
var schedule = Bells({
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
});
// => Object
```

#### `Bells#currentPeriod([now])`
Get the name of the current period, or null. See above for more info about time
parameters.

```js
schedule.currentPeriod('13:00');
// => '6 (3rd lunch)'
schedule.currentPeriod('14:15');
// => '8'
schedule.currentPeriod('16:00');
// => null
```

#### `Bells#nextBell([now])`
Get the time of the next bell, as a `Moment()`. See above for more info about
time parameters.

```js
schedule.nextBell('7:10');
// => Moment('07:15', 'HH:mm')
schedule.nextBell('8:23');
// => Moment('08:29', 'HH:mm')
schedule.nextBell('16:00');
// => null
```

### `Bells.Predictor(criteria)`
Create a `Predictor` object. See below for the layout of `criteria`.

Note that a predictor only associates a string to a specific set of criteria. It
does not associate a `Bells` object to that string.

```js
var Bells = require('bells');

var Predictor = Bells.Predictor({
	// 'none' is interpreted to mean there is no school.
	// [0, 6] means that this applies on those days of the week, where
	// 	0 is Sunday and 6 is Saturday.
	'none': [0, 6],

	// 'default' is the fallback bell schedule.
	// There can only be one default.
	'Normal Day': 'default',

	// This applies when the day equals 1 (Monday).
	// A specific day of the week gets higher priority than 'default', but lower
	// 	than a specific date.
	'Monday': 1,

	// This applies on 4/14/14 and 4/17/14.
	// A specific date overrides any day-of-week selector or the 'default'.
	'FCAT': ['4/17/2014', '4/22/2014', '4/23/2014'],

	// You can also specify a string with a date instead of an array of strings
	'FCAT - Monday': '4/14/2014',
});
// => Object
```

#### `Predictor#predict(date)`
Predict the bell schedule for a certain date. (The date must be a full
month/day/year, in any format guessable by [Moment][Moment-ParseString].)

```js
Predictor.predict('2014-04-15'); // normal Tuesday
// => 'Normal Day'
Predictor.predict('2014-04-21'); // normal Monday
// => 'Monday'
Predictor.predict('2014-04-14'); // FCAT Monday
// => 'FCAT - Monday'
Predictor.predict('2014-04-19'); // Saturday
// => 'none'
```

[Moment]: http://momentjs.com/
[Moment-ParseString]: http://momentjs.com/docs/#/parsing/string/
