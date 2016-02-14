var config = {
    lang: 'en',
    time: {
        timeFormat: 12
    },
    compliments: {
        interval: 60000,
        fadeInterval: 4000,
        morning: [
			'<i class="fa-5x fa-hand-peace-o"></i>',
			'Good morning!',
            'Enjoy your day!',
            'You look great today!',
			'I like your style!',
			'I like your socks!',
			'Hello, good-looking!',
			'I like your face!',
			'I dig your look!',
			'You light up the room!'
			
        ],
        afternoon: [
            'You look nice!',
            'You look terrific!',
            "You're not a total idiot!",
			'Well done!',
			'Nice fine motor control!',
			'Your skin is radiant!',
			'Killer boots, man!',
			'You look symmetrical!',
			"You're sweeter than High Fructose Corn Syrup!",
			'Nice job on that thing you did that time!',
			'That color is perfect on you!'
			
        ],
        evening: [
			'You have great taste in mirrors!',
            'Your face makes other people look ugly!',
			'Your hair looks stunning!',
			'You could survive a Zombie apocalypse. Maybe.',
			'Reading IS fundamental!',
			'Dogs love you! Some of them. Some dogs are dumb though, so...',
			'The Force is strong with you',
			'I was talking to the toilet. He said you have a nice butt.',
			'Dogs, better than people, since forever'
        ],
		bedtime: [
			'Sweet dreams!',
			'Good Night',
			'See you tomorrow!',
			'Sleep tight',
			'Sleep well!'
		],
        birthday: [
			'<i class="fa-3x fa-birthday-cake"></i><br>Happy Birthday ',
            'Happy Birthday ',
            'Have a great birthday today ',
            'Yay, your birthday is today, '
        ],
        christmas: [
            'Merry Christmas!',
            '¡Feliz Navidad!',
            'Nollaig Shona Duit!',
			'Happy Christmas!'
        ]

    },
    news: {
        feed: [
			'http://feeds.reuters.com/reuters/healthNews',
			'http://feeds.reuters.com/reuters/oddlyEnoughNews',
			'http://feeds.reuters.com/Reuters/domesticNews',
			'http://feeds.reuters.com/Reuters/worldNews'
		]
    },
	traffic: {
		active: true,
		regular: false,			//Regular is true if you work a consistent schedule and want traffic displayed before work, false if you want your commute displayed all the time
		weekStart: 1,
		weekEnd: 5,				//Day of the week, Sunday = 0, etc
		startTimeHour: 7, 		//Hour of the day you at which you start work, in 24H format
		startTimeMinute: 0, 	//Minute of the day you at which you start work
		preTime: 3				//How many hours before work you'd like to see traffic info
	},
	calendar: {
		traffic: true
	}
};
