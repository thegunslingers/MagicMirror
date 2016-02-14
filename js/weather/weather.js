var weather = {
	// Default language is Dutch because that is what the original author used
	lang: config.lang || 'en',
	iconTable: {
		'clear-day':'wi-day-sunny',
		'clear-night':'wi-night-clear',
			'cloudy-day':'wi-day-cloudy',
			'cloudy-night':'wi-night-cloudy',
		'cloudy':'wi-cloudy',
			'fog-day':'wi-day-fog',
			'fog-night':'wi-night-fog',
		'fog':'wi-fog',
			'hail-day':'wi-day-hail',
			'hail-night':'wi-night-hail',
		'hail':'wi-hail',
		'partly-cloudy-day':'wi-day-cloudy',
		'partly-cloudy-night':'wi-night-partly-cloudy',
			'rain-day':'wi-day-rain',
			'rain-night':'wi-night-rain',
		'rain':'wi-rain',
			'snow-day':'wi-day-snow',
			'snow-night':'wi-night-snow',
		'snow':'wi-snow',
			'sleet-day':'wi-day-sleet',
			'sleet-night':'wi-night-sleet',
		'sleet':'wi-sleet',
		'thunderstorm':'wi-thunderstorm',
		'tornado':'wi-tornado',
		'wind':'wi-windy'
	},
	moonIconTable: {
		'0':'wi-moon-new',
		'1':'wi-moon-waxing-crescent-1',
		'2':'wi-moon-waxing-crescent-2',
		'3':'wi-moon-waxing-crescent-3',
		'4':'wi-moon-waxing-crescent-4',
		'5':'wi-moon-waxing-crescent-5',
		'6':'wi-moon-waxing-crescent-6',
		'7':'wi-moon-first-quarter',
		'8':'wi-moon-waxing-gibbous-1',
		'9':'wi-moon-waxing-gibbous-2',
		'10':'wi-moon-waxing-gibbous-3',
		'11':'wi-moon-waxing-gibbous-4',
		'12':'wi-moon-waxing-gibbous-5',
		'13':'wi-moon-waxing-gibbous-6',
		'14':'wi-moon-full',
		'15':'wi-moon-waning-gibbous-1',
		'16':'wi-moon-waning-gibbous-2',
		'17':'wi-moon-waning-gibbous-3',
		'18':'wi-moon-waning-gibbous-4',
		'19':'wi-moon-waning-gibbous-5',
		'20':'wi-moon-waning-gibbous-6',
		'21':'wi-moon-third-quarter',
		'22':'wi-moon-waning-crescent-1',
		'23':'wi-moon-waning-crescent-2',
		'24':'wi-moon-waning-crescent-3',
		'25':'wi-moon-waning-crescent-4',
		'26':'wi-moon-waning-crescent-5',
		'27':'wi-moon-waning-crescent-6'
	},
	temperatureLocation: '.temp',
	weatherSummaryLocation: '.weathersummary',
	feelsLikeTempLocation: '.feelsliketemp',
	windSunLocation: '.windsun',
	forecastLocation: '.forecast',
	apiBase: 'https://api.forecast.io/forecast/',
	apiKey: keys.weather.apiKey,
	address: keys.weather.address,
	snowEffectActive: 'N',
	updateInterval: 300000,	//forecast.io limits free accounts to 1000 API calls per day. To stay under this limit, keep the updateInterval to 90000 or greater
	fadeInterval: 1000,
	intervalId: null
}

/**
 * Rounds a float to one decimal place
 * @param  {float} temperature The temperature to be rounded
 * @return {float}             The new floating point value
 */
weather.roundValue = function (temperature) {
	return parseFloat(temperature).toFixed(1);
}

weather.mainIcon = function (icon,moonPhase,isDaytime){

	if(icon=='clear-day' || icon=='partly-cloudy-day' || icon == 'partly-cloudy-night' || icon == 'thunderstorm' || icon == 'tornado' || icon == 'wind'){
		return weather.iconTable[icon];
	}else if(icon == 'clear-night'){
		return weather.moonIconTable[moonPhase];
	}else{
		if(isDaytime){
			return weather.iconTable[icon + '-day'];
		} else{
			return weather.iconTable[icon + '-night'];
		}
	}
}

weather.windDirection = function (windAngle){
	if (windAngle >= 11.25 && windAngle < 33.75) {
		return 'NNE';
	} else if (windAngle >= 33.75 && windAngle < 56.25) {
		return 'NE';
	} else if (windAngle >= 56.25 && windAngle < 78.75) {
		return 'ENE';
	} else if (windAngle >= 78.75 && windAngle < 101.25) {
		return 'E';
	} else if (windAngle >= 101.25 && windAngle < 123.75) {
		return 'ESE';
	} else if (windAngle >= 123.75 && windAngle < 146.25) {
		return 'SE';
	} else if (windAngle >= 146.25 && windAngle < 168.75) {
		return 'SSE';
	} else if (windAngle >= 168.75 && windAngle < 191.25) {
		return 'S';
	} else if (windAngle >= 191.25 && windAngle < 213.75) {
		return 'SSW';
	} else if (windAngle >= 213.75 && windAngle < 236.25) {
		return 'SW';
	} else if (windAngle >= 236.25 && windAngle < 258.75) {
		return 'WSW';
	} else if (windAngle >= 258.75 && windAngle < 281.25) {
		return 'W';
	} else if (windAngle >= 281.25 && windAngle < 303.75) {
		return 'WNW';
	} else if (windAngle >= 303.75 && windAngle < 326.25) {
		return 'NW';
	} else if (windAngle >= 326.25 && windAngle < 348.75) {
		return 'NNW';
	} else {
		return 'N';
	} 
}

/**
 * Retrieves the current temperature and weather patter from the OpenWeatherMap API
 */
weather.updateCurrentWeather = function () {

	var geocoder = new google.maps.Geocoder();

	geocoder.geocode( { 'address': weather.address}, function(results, status) {

		if (status === google.maps.GeocoderStatus.OK) {
			var latitude = results[0].geometry.location.lat();
			var longitude = results[0].geometry.location.lng();
			var coordinates= latitude + ',' + longitude;

			var forecastURL = weather.apiBase + weather.apiKey + '/' + coordinates;

			$.ajax({
				type: 'GET',
				url: 'controllers/weather.php?',
				dataType: 'json',
				data: {url: forecastURL},
				success: function (data) {
					
					var _temperature = weather.roundValue(data.currently.temperature);
						_wind = weather.roundValue(data.currently.windSpeed),
						_windDirection = weather.windDirection(weather.roundValue(data.currently.windBearing)),
						_moonPhase = Math.round(27*data.daily.data[0].moonPhase);
						_icon = data.currently.icon,
						_apparentTemperature = weather.roundValue(data.currently.apparentTemperature),
						_apparentTemperatureDifferential = 5;

					if (data.currently.icon == 'snow'){
						weather.snowEffectActive = 'Y';
					} else{
						weather.snowEffectActive = 'N';
					}
						
					var _newFeelsLikeHtml = '';
					
					if(Math.abs(_temperature - _apparentTemperature) > _apparentTemperatureDifferential){
						_newFeelsLikeHtml = '<p class="padding">Feels like ' + _apparentTemperature + '&deg;</span>';
					}
					
					$(weather.feelsLikeTempLocation).updateWithText(_newFeelsLikeHtml, weather.fadeInterval);		

					var _newSummaryHtml = '<p class="padding">' + data.hourly.summary;
					
					$(weather.weatherSummaryLocation).updateWithText(_newSummaryHtml, weather.fadeInterval);

					var _now = moment().format('HH:mm'),
						_sunrise = moment(data.daily.data[0].sunriseTime*1000).format('HH:mm') + 'AM',
						_sunset = moment(data.daily.data[0].sunsetTime*1000).format('HH:mm');
						_sunset12 = moment(data.daily.data[0].sunsetTime*1000).format('hh:mm') + 'PM';
						
					var _newWindHtml = '<span class="wi wi-strong-wind xdimmed"></span> ' + _windDirection + ' @ ' + _wind + 'mph', 
						_newSunHtml = '<span class="wi wi-sunrise xdimmed"></span> ' + _sunrise;
						_isDaytime = false;

					if (_sunrise < _now && _sunset > _now) {
						_newSunHtml = '<span class="wi wi-sunset xdimmed"></span> ' + _sunset12;
						_isDaytime = true;
					}

					$(weather.windSunLocation).updateWithText(_newWindHtml + ' ' + _newSunHtml, weather.fadeInterval);


					var _mainIcon = weather.mainIcon(_icon,_moonPhase,_isDaytime);

					var _icon = '<span class="icon ' + _mainIcon + ' dimmed wi"></span>';

					var _newTempHtml = _icon + '' + _temperature + '&deg;';

					$(weather.temperatureLocation).updateWithText(_newTempHtml, weather.fadeInterval);
					
					
					var _opacity = 1,
						_forecastHtml = '';

					_forecastHtml += '<table class="forecast-table">';

					for (var i = 0, count = data.daily.data.length; i < count; i++) {

						var _forecast = data.daily.data[i];

						_forecastHtml += '<tr style="opacity:' + _opacity + '">';

						_forecastHtml += '<td class="day">' + moment(_forecast.time, 'X').format('ddd') + '</td>';
						_forecastHtml += '<td class="icon-small ' + weather.iconTable[_forecast.icon] + '"></td>';
						_forecastHtml += '<td class="temp-max">' + weather.roundValue(_forecast.temperatureMax) + '</td>';
						_forecastHtml += '<td class="temp-min">' + weather.roundValue(_forecast.temperatureMin) + '</td>';

						_forecastHtml += '</tr>';

						_opacity -= 0.125;

					}

					_forecastHtml += '</table>';

					$(weather.forecastLocation).updateWithText(_forecastHtml, weather.fadeInterval);
					
				}.bind(this),
				error: function () {
				}
			});
	
		} 
	});

}

/*
window.onload = function(){
	//canvas init
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	//canvas dimensions
	var W = window.innerWidth;
	var H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	//snowflake particles
	var mp = 50; //max particles
	var particles = [];
	for(var i = 0; i < mp; i++)
	{
		particles.push({
			x: Math.random()*W, //x-coordinate
			y: Math.random()*H, //y-coordinate
			r: Math.random()*4+1, //radius
			d: Math.random()*mp //density
		})
	}
	
	//Lets draw the flakes
	function draw()
	{
		ctx.clearRect(0, 0, W, H);
		
		if(weather.snowEffectActive == 'Y'){
			ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		} else {
			ctx.fillStyle = "rgba(255, 255, 255, 0)";
		}
		ctx.beginPath();
		for(var i = 0; i < mp; i++)
		{
			var p = particles[i];
			ctx.moveTo(p.x, p.y);
			ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
		}
		ctx.fill();
		update();
	}
	
	//Function to move the snowflakes
	//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
	var angle = 0;
	function update()
	{
		angle += 0.01;
		for(var i = 0; i < mp; i++)
		{
			var p = particles[i];
			//Updating X and Y coordinates
			//We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
			//Every particle has its own density which can be used to make the downward movement different for each flake
			//Lets make it more random by adding in the radius
			p.y += Math.cos(angle+p.d) + 1 + p.r/2;
			p.x += Math.sin(angle) * 2;
			
			//Sending flakes back from the top when it exits
			//Lets make it a bit more organic and let flakes enter from the left and right also.
			if(p.x > W+5 || p.x < -5 || p.y > H)
			{
				if(i%3 > 0) //66.67% of the flakes
				{
					particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
				}
				else
				{
					//If the flake is exitting from the right
					if(Math.sin(angle) > 0)
					{
						//Enter from the left
						particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
					}
					else
					{
						//Enter from the right
						particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
					}
				}
			}
		}
	}
	
	//animation loop
	setInterval(draw, 33);
}
*/


weather.init = function () {

	this.updateCurrentWeather();
	
	this.intervalId = setInterval(function () {
		this.updateCurrentWeather();
	}.bind(this), this.updateInterval);

}
