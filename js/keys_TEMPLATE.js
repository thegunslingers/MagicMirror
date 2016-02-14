//rename this file to keys.js after you fill in the relevant information to enable functionality

var keys = {
    weather: {
		apiKey: 'YOUR_API_KEY',
		//Go to https://developer.forecast.io/ to register and get your free API key
		address: 'YOUR_HOME_ADDRESS'
    },
	traffic: {
		params: {
			origin: 'place_id:YOUR_STARTING_PLACE_ID',
			destination: 'place_id:YOUR_ENDING_PLACE_ID',
            // Use the PlaceID Finder: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
			departure_time: 'now',
			key: 'YOUR_GOOGLE_MAPS_API_KEY'
            // Go here to get your Google Maps API key: https://developers.google.com/maps/documentation/directions/
		}
	},
	calendar: {
		maximumEntries: 10, // Total Maximum Entries
		displaySymbol: true,
		defaultSymbol: 'calendar', // Fontawsome Symbol see http://fontawesome.io/cheatsheet/
		urls: [
			{
				symbol: 'calendar-o',
				url: 'CALENDAR.ics ADDRESS'
				// For Google Calendar, it's the 'Private Address' under Calendar Settings when viewing your Calendar
			},
			{
				symbol: 'calendar-check-o',
				url: 'CALENDAR.ics ADDRESS'
			}
		]
	},
	birthdays: [
		{
			day:DAY_OF_FIRST_BIRTHDAY,
			month:MONTH_OF_FIRST_BIRTHDAY,
			name:'NAME_OF_PERSON_WITH_FIRST_BIRTHDAY'
		},{
			day:DAY_OF_SECOND_BIRTHDAY,
			month:MONTH_OF_SECOND_BIRTHDAY,
			name:'NAME_OF_PERSON_WITH_SECOND_BIRTHDAY'
		}
	]
}
