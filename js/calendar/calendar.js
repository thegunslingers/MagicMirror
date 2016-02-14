var calendar = {
	eventList: [],
	calendarLocation: '.calendar',
	updateDataInterval: 60000,
	fadeInterval: 0,
	intervalId: null,
	dataIntervalId: null,
	maximumEntries: keys.calendar.maximumEntries || 10,
	calendarUrl: (typeof keys.calendar.urls == 'undefined') ? keys.calendar.url : keys.calendar.urls[0].url,
	calendarPos: 0,
	defaultSymbol: keys.calendar.defaultSymbol || 'none',
	calendarSymbol: (typeof keys.calendar.urls == 'undefined') ? keys.calendar.defaultSymbol || 'none' : keys.calendar.urls[0].symbol,
	displaySymbol: (typeof keys.calendar.displaySymbol == 'undefined') ? false : keys.calendar.displaySymbol,
	params: {
		origin: keys.traffic.params.origin,
		destination: '0,0',
		departure_time: keys.traffic.params.departure_time,
		key: keys.traffic.params.key
	},
	traffic: config.calendar.traffic,
	travelBuffer: 300
};

calendar.processEvents = function (url, events) {
	tmpEventList = [];
	var eventListLength = this.eventList.length;
	for (var i = 0; i < eventListLength; i++) {
		if (this.eventList[i]['url'] != url) {
			tmpEventList.push(this.eventList[i]);
		}
	}
	this.eventList = tmpEventList;

	for (var i in events) {

		var e = events[i];
		for (var key in e) {
			var value = e[key];
			var seperator = key.search(';');
			if (seperator >= 0) {
				var mainKey = key.substring(0,seperator);
				var subKey = key.substring(seperator+1);

				var dt;
				if (subKey == 'VALUE=DATE') {
					//date
					dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8));
				} else {
					//time
					dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8), value.substring(9,11), value.substring(11,13), value.substring(13,15));
				}

				if (mainKey == 'DTSTART') e.startDate = dt;
				if (mainKey == 'DTEND') e.endDate = dt;
			}
		}

		if (e.startDate == undefined){
			//some old events in Gmail Calendar is "start_date"
			//FIXME: problems with Gmail's TimeZone
			var days = moment(e.DTSTART).diff(moment(), 'days');
			var seconds = moment(e.DTSTART).diff(moment(), 'seconds');
			var startDate = moment(e.DTSTART);
		} else {
			var days = moment(e.startDate).diff(moment(), 'days');
			var seconds = moment(e.startDate).diff(moment(), 'seconds');
			var startDate = moment(e.startDate);
		}

		//only add future events, days doesn't work, we need to check seconds
		if (seconds >= 0) {
			if (seconds <= 60*60*3) {
				var time_string = moment(startDate).fromNow();
				if (e.LOCATION !== undefined){
					var unix_time = moment(startDate).unix();
					var eventLocation = e.LOCATION;
				}
			}else if (seconds >= 60*60*24*2){
				var time_string = moment(startDate).fromNow();
			}else {
				var time_string = moment(startDate).calendar();
			}
			if (!e.RRULE) {
				this.eventList.push({'description':e.SUMMARY,'location':eventLocation,'unixTime':unix_time,'seconds':seconds,'days':time_string,'url': url, symbol: this.calendarSymbol});
			}
			e.seconds = seconds;
		}
		// Special handling for rrule events
		if (e.RRULE) {
			var options = new RRule.parseString(e.RRULE);
			options.dtstart = e.startDate;
			var rule = new RRule(options);

			var oneYear = new Date();
			oneYear.setFullYear(oneYear.getFullYear() + 1);

			var dates = rule.between(new Date(), oneYear, true, function (date, i){return i < 10});
			for (date in dates) {
				var dt = new Date(dates[date]);
				var days = moment(dt).diff(moment(), 'days');
				var seconds = moment(dt).diff(moment(), 'seconds');
				var startDate = moment(dt);
				if (seconds >= 0) {
					if (seconds <= 60*60*3 || seconds >= 60*60*24*2) {
						var time_string = moment(dt).fromNow();
					} else {
						var time_string = moment(dt).calendar()
					}
					this.eventList.push({'description':e.SUMMARY,'seconds':seconds,'days':time_string,'url': url, symbol: this.calendarSymbol});
				}
			}
		}
	};

	this.eventList = this.eventList.sort(function(a,b){return a.seconds-b.seconds});

	// Limit the number of entries.
	this.eventList = this.eventList.slice(0, calendar.maximumEntries);



};

calendar.updateData = function (callback) {
	new ical_parser("controllers/calendar.php" + "?url="+encodeURIComponent(this.calendarUrl), function(cal) {
		this.processEvents(this.calendarUrl, cal.getEvents());

		this.calendarPos++;
		if ((typeof keys.calendar.urls == 'undefined') || (this.calendarPos >= keys.calendar.urls.length)) {
			this.calendarPos = 0;
			// Last Calendar in List is updated, run Callback (i.e. updateScreen)
			if (callback !== undefined && Object.prototype.toString.call(callback) === '[object Function]') {
				callback(this.eventList);
			}
		} else {
			// Loading all Calendars in parallel does not work, load them one by one.
			setTimeout(function () {
				this.updateData(this.updateCalendar.bind(this));
			}.bind(this), 10);
		}
		if (typeof keys.calendar.urls != 'undefined') {
			this.calendarUrl = keys.calendar.urls[this.calendarPos].url;
			this.calendarSymbol = keys.calendar.urls[this.calendarPos].symbol || this.defaultSymbol;
		}

	}.bind(this));

};

calendar.updateCalendar = function (eventList) {

	var table = $('<table/>').addClass('xsmall').addClass('calendar-table');


	if(eventList.length > 0){

		if (typeof eventList[0].location !== 'undefined' && calendar.traffic) {
			var geocoder = new google.maps.Geocoder();

			geocoder.geocode( { 'address': eventList[0].location}, function(results, status) {

				if (status === google.maps.GeocoderStatus.OK) {
					var latitude = results[0].geometry.location.lat();
					var longitude = results[0].geometry.location.lng();
					calendar.params.destination = latitude + ',' + longitude;

					$.ajax({
						type: 'GET',
						url: 'controllers/traffic.php?',
						dataType: 'json',
						data: calendar.params,
						success: function (data) {
							calendar.traffic(data,eventList,table);
						}.bind(this),
						error: function () {
							calendar.fillTable(eventList,table);
						}
					});
				} else {
					calendar.fillTable(eventList,table);
				}
			});
		} else {
			calendar.fillTable(eventList,table);
		}

	}else{
		$(this.calendarLocation).updateWithText('', this.fadeInterval);
	}

};

calendar.traffic = function(data,eventList,table){
	var opacity = 1;

	var row = $('<tr/>').css('opacity', opacity);
	if (calendar.displaySymbol) {
		row.append($('<td/>').addClass('fa').addClass('fa-'+eventList[0].symbol).addClass('calendar-icon'));
	}
	row.append($('<td/>').html(eventList[0].description).addClass('description'));
	row.append($('<td/>').html(eventList[0].days).addClass('days dimmed'));
	table.append(row);
	opacity -= 0.125;

	var travelTime = data.routes[0].legs[0].duration_in_traffic.value,
			duration = data.routes[0].legs[0].duration.value,
			trafficTime = travelTime - duration,
			trafficPhrase = traffic.getPhrase(trafficTime);

	if(travelTime > 0){
		var leaveByTimeSeconds = eventList[0].unixTime - (travelTime + calendar.travelBuffer);
		var unix_time = moment().unix();
		if (leaveByTimeSeconds > (unix_time + calendar.travelBuffer)){
			var leaveByTime = new Date(leaveByTimeSeconds*1000);
			var hours = leaveByTime.getHours();

			if(hours>12){
				hours-=12;
			}

			var minutes = "0" + leaveByTime.getMinutes();
			var formattedTime = hours + ':' + minutes.substr(-2);

			row = $('<tr/>').css('opacity',opacity);
			row.append($('<td/>').html(''));
			row.append($('<td/>').html(trafficPhrase + ', leave by ' + formattedTime).addClass('description'));
		} else {
			row = $('<tr/>').css('opacity',opacity);
			row.append($('<td/>').html(''));
			row.append($('<td/>').html(trafficPhrase + ', leave now').addClass('description'));
		}

		table.append(row);
		opacity -= 0.125;
	}

	for (var i in eventList) {
		if(i>0) {
			var e = eventList[i];
			row = $('<tr/>').css('opacity', opacity);
			if (calendar.displaySymbol) {
				row.append($('<td/>').addClass('fa').addClass('fa-'+e.symbol).addClass('calendar-icon'));
			}
			row.append($('<td/>').html(e.description).addClass('description'));
			row.append($('<td/>').html(e.days).addClass('days dimmed'));
			table.append(row);
			opacity -= 0.125;
		}
	}
	$(calendar.calendarLocation).updateWithText(table, this.fadeInterval);
};

calendar.fillTable = function(eventList,table){
	var opacity = 1;

	for (var i in eventList) {
		var e = eventList[i];

		var row = $('<tr/>').css('opacity', opacity);
		if (calendar.displaySymbol) {
			row.append($('<td/>').addClass('fa').addClass('fa-'+e.symbol).addClass('calendar-icon'));
		}
		row.append($('<td/>').html(e.description).addClass('description'));
		row.append($('<td/>').html(e.days).addClass('days dimmed'));
		table.append(row);
		opacity -= 0.125;
	}
	$(calendar.calendarLocation).updateWithText(table, this.fadeInterval);
};

calendar.init = function () {

	this.updateData(this.updateCalendar.bind(this));

	this.dataIntervalId = setInterval(function () {
		this.updateData(this.updateCalendar.bind(this));
	}.bind(this), this.updateDataInterval);

};
