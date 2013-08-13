(function(Time, NonstaticClass, Panel, HTML, Event){
this.Calendar = (function(OverflowPanel, panelHtml, dateCellHtml, addCellEvent){
	function DateCell(selector, date){
		this.attach({
			leaveborder : function(e){
				console.log(1);
			}
		});

		this.add(date);
	};
	DateCell = new NonstaticClass(DateCell, null, OverflowPanel.prototype);

	DateCell.properties({
		add : function(date){
			var monthData = [],
			
				firstDay = new Date(date.getTime()),

				lastDay = new Date(date.getTime());
			
			firstDay.setDate(1);
			firstDay.setHours(0, 0, 0, 0);
			
			lastDay.setMonth(lastDay.getMonth() + 1, 0);
			lastDay.setHours(0, 0, 0, 0);

			for(
				var i = firstDay.getDay() * -1,
					j = lastDay.getDate(),
					k = new Date(new Date(firstDay.getTime()).setDate(i + 1));
				i < j;
				i++	
			){
				monthData.push({
					time : k.getTime(),
					date : k.getDate(),
					localString : k.toLocaleDateString(),
					monthStatus : i < 0 ? "last" : "current"
				});

				k.setDate(k.getDate() + 1);
			}

			this.innerHTML += dateCellHtml.render({
				monthData : monthData
			});
		},
		focus : function(date){d
			
		}
	});


	function Calendar(){
		this.combine(panelHtml.create());

		new DateCell.constructor(this.find("dd>ul")[0], new Date());
	};
	Calendar = new NonstaticClass(Calendar, "Bao.UI.Control.Time.Calendar", Panel.prototype);

	Calendar.properties({
		
	});

	return Calendar.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	// panelHtml
	new HTML([
		'<div class="calendar themeBgColor">',
			'<dl>',
				'<dt class="inlineBlock whiteFont">',
					'@for(["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] ->> title){',
						'<span>{title}</span>',
					'}',
				'</dt>',
				'<dd>',
					'<ul></ul>',
				'</dd>',
			'</dl>',
		'</div>'
	].join("")),
	// dateCellHtml
	new HTML([
		'<li>',
			'<ol class="inlineBlock">',
				'@for(monthData ->> dt){',
					'<li monthstatus="{dt.monthStatus}" time="{dt.time}" localstring="{dt.localString}">{dt.date}</li>',
				'}',
			'</ol>',
		'</li>'
	].join("")),
	// addCellEvent
	new Event("addcell")
));

Time.members(this);
}.call(
	{},
	Bao.UI.Control.Time,
	jQun.NonstaticClass,
	Bao.API.DOM.Panel,
	jQun.HTML,
	jQun.Event
));