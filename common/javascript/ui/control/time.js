(function(Time, NonstaticClass, Panel, HTML, Event){
this.Date = (function(OverflowPanel, panelHtml, dateCellHtml, addCellEvent){
	function DateCell(selector, date){
		this.attach({
			leaveborder : function(e){
				console.log(1);
			}
		});
	};
	DateCell = new NonstaticClass(DateCell, null, OverflowPanel.prototype);

	DateCell.properties({
		add : function(date){
			
		}
	});


	function Date(){
		this.combine(panelHtml.create());

		new DateCell.constructor(this.find("dd>ul")[0], new Date());
	};
	Date = new NonstaticClass(Date, "Bao.UI.Control.Time.Date", Panel.prototype);

	Date.properties({
		
	});

	return Date.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	// panelHtml
	new HTML([
		'<div class="date">',
			'<dl>',
				'<dt class="inlineBlock">',
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
		'@for(schedules ->> week){',
			'<li>',
				'<ol>',
					'@for(week ->> day){',
						'<li></li>',
					'}',
				'</ol>',
			'</li>',
		'}'
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