﻿(function(Time, NonstaticClass, Panel, HTML, Event){
this.Calendar = (function(OverflowPanel, Date, calendarHtml, tablePanelHtml, dateTableHtml, focusDateEvent){
	function DateTable(){
		///	<summary>
		///	日期表格。
		///	</summary>
		var dateTable = this;

		this.combine(tablePanelHtml.create());
		// 采用溢出功能
		new OverflowPanel(this[0]);

		this.attach({
			userclick : function(e){
				var dateEl = jQun(e.target).between('li[datestatus]', this);

				if(dateEl.length === 0)
					return;

				dateTable.focus(dateEl.get("time", "attr"));
			},
			leaveborder : function(e){
				// 如果偏离边框的距离小于2行半就return 45*2.5=112.5
				if(e.offsetBorder < 110)
					return;

				var toFocusEl = dateTable.find(
						'li:' + (e.direction === "top" ? "first" : "last") + '-child ol > li[datestatus="0"]'
					);

				toFocusEl.splice(1);

				dateTable.focus(toFocusEl.get("time", "attr") - 0);
			}
		});
	};
	DateTable = new NonstaticClass(DateTable, null, Panel.prototype);

	DateTable.properties({
		addMonth : function(time){
			///	<summary>
			///	添加一个月的表格。
			///	</summary>
			/// <param name="time" type="number">当月第一天的0时0分的毫秒数</param>
			var firstDate = new Date(time);
			
			// 设置本月第一天
			firstDate.setDate(1);

			// 如果恢复已有月份数据成功
			if(this.restore(firstDate.getTime()))
				return;
			
			var lastDate = new Date(time),

				monthData = [], month = firstDate.getMonth();

			// 设置本月最后一天
			lastDate.setMonth(month + 1, 0);

			// 数据
			for(
				var i = firstDate.getDay() * -1,
					l = lastDate.getDay(),
					// l === 6：判断这个月的最后一天是否是星期6，决定这周包含了其它月的日期
					j = lastDate.getDate() - (l === 6 ? 0 : l + 1),
					k = new Date(new Date(firstDate.getTime()).setDate(i + 1));
				i < j;
				i++	
			){
				var d = k.getDate();

				monthData.push({
					time : k.getTime(),
					date : d,
					day : k.getDay(),
					// 0 : 表示本月日期，-1表示上个月日期
					dateStatus : i < 0 ? "-1" : "0"
				});

				k.setDate(d + 1);
			}

			// 渲染数据
			dateTableHtml.create({
				monthData : monthData,
				month : month + 1,
				year : firstDate.getFullYear(),
				time : firstDate.getTime(),
				weeks : Math.ceil(monthData.length / 7)
			}).appendTo(this[0]);
		},
		clearTable : function(){
			///	<summary>
			///	清空表格。
			///	</summary>
			this.save();
			this.innerHTML = "";
		},
		focus : function(time){
			///	<summary>
			///	聚焦到某一天上。
			///	</summary>
			/// <param name="time" type="number">当天任意时刻的毫秒数</param>
			var focusedDateEl,
			
				oldFocusedDateEl = this.find('ol > li.focusedDate');

			time = new Date(time - 0).setHours(0, 0, 0, 0);
			focusedDateEl = this.find('ol > li[time="' + time + '"]');

			if(oldFocusedDateEl.length > 0){
				var oldTime = oldFocusedDateEl.get("time", "attr") - 0;

				// 如果2个日期的时间差小于1天，就证明是同一天
				if(oldTime === time){
					return;
				}

				var date = new Date(oldTime);

				oldFocusedDateEl.classList.remove("focusedDate");

				// 如果是同月份的日期切换
				if(date.getMonth() === new Date(time).getMonth()){
					focusedDateEl.classList.add("focusedDate");
					focusDateEvent.trigger(focusedDateEl[0]);
					return;
				}

				this.find('li[time="' + date.setDate(1) + '"]').classList.remove("focused");
			}
			
			var monthEl = this.find('li[time="' + new Date(time).setDate(1) + '"]');

			// 更新月份
			this.updateSiblingMonths(time);

			// 如果聚焦元素找不到
			if(focusedDateEl.length === 0){
				focusedDateEl = this.find('ol > li[time="' + time + '"]');
				monthEl = focusedDateEl.parent().parent();
			}
			
			monthEl.classList.add("focused");
			focusedDateEl.classList.add("focusedDate");
			focusDateEvent.trigger(focusedDateEl[0]);
		},
		restore : function(time){
			///	<summary>
			///	恢复已储存指定时间的当月表格。
			///	</summary>
			/// <param name="time" type="number">当月第一天的0时0分的毫秒数</param>
			var liEl = jQun();

			return !this.savedTable.every(function(li){
				liEl.splice(0, 1, li);
					
				// 如果已经存在该月
				if(liEl.get("time", "attr") == time){
					liEl.appendTo(this[0]);
					return false;
				}

				return true;
			}, this);
		},
		save : function(){
			///	<summary>
			/// 储存目前的月份表格。
			///	</summary>
			this.savedTable = this.find(">li");
		},
		savedTable : undefined,
		top : function(){
			///	<summary>
			///	将当前聚焦的日期置顶。
			///	</summary>
			var top,

				focusedDateEl = this.find("li.focusedDate"),

				focusedMonthEl = focusedDateEl.between("li.focused", this[0]);

			// 如果当前聚焦的日期是属于下个月的容器内
			if(focusedMonthEl.length === 0){
				top = this.find(">li.focused").height() * -1;
			}
			else {
				top = Math.floor(focusedMonthEl.find("li").indexOf(focusedDateEl[0]) / 6 - 1) * -45;
			}

			this.set("top",	top + "px", "css");
		},
		updateSiblingMonths : function(time){
			///	<summary>
			///	更新相邻的月份（指定月份的上个月，指定的月份，指定的月份的下一个月）。
			///	</summary>
			/// <param name="time" type="number">指定月份的某一天的0时0分的毫秒数</param>
			var date = new Date(time),
				
				month = date.getMonth(), year = date.getFullYear();

			// 清空
			this.clearTable();

			for(var i = -1;i < 2;i++){
				date.setFullYear(year, month + i, 1);
				this.addMonth(date.getTime());
			}
		}
	});


	function Calendar(_isStretch){
		var dateTable = new DateTable.constructor();

		_isStretch = _isStretch === true;

		this.assign({
			dateTable : dateTable,
			isStretch : _isStretch
		});

		this.combine(calendarHtml.create());
		dateTable.appendTo(this.find("dd")[0]);

		if(!_isStretch)
			return;

		var calendar = this, classList = calendar.classList;

		jQun(window).attach({
			touchstart : function(e){
				if(jQun(e.target).between(calendar[0], calendar.parent()[0]).length > 0){
					classList.add("stretch");
					return;
				}
	
				dateTable.top();
				classList.remove("stretch");
			},
			focusdate : function(e){
				if(calendar.classList.contains("stretch"))
					return;
				
				dateTable.top();
			}
		});
	};
	Calendar = new NonstaticClass(Calendar, "Bao.UI.Control.Time.Calendar", Panel.prototype);

	Calendar.properties({
		dateTable : undefined,
		isStretch : false
	});

	return Calendar.constructor;
}(
	Bao.API.DOM.OverflowPanel,
	window.Date,
	// calendarHtml
	new HTML([
		'<div class="calendar lightBdColor">',
			'<dl>',
				'<dt class="inlineBlock whiteFont">',
					'@for(["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] ->> title, day){',
						'<span day="{day}">{title}</span>',
					'}',
				'</dt>',
				'<dd></dd>',
			'</dl>',
		'</div>'
	].join("")),
	// tablePanelHtml
	new HTML('<ul></ul>'),
	// dateTableHtml
	new HTML([
		'<li time="{time}" weeks={weeks}>',
			'<ol class="inlineBlock">',
				'@for(monthData ->> dt){',
					'<li datestatus="{dt.dateStatus}" day="{dt.day}" time="{dt.time}">',
						'<small>{month}月</small>',
						'<span>{dt.date}</span>',
					'</li>',
				'}',
			'</ol>',
			'<p class="whiteFont">',
				//'<small>{year}年</small>',
				'<strong>{year}年{month}月</strong>',
			'</p>',
		'</li>'
	].join("")),
	// focusDateEvent
	new Event("focusdate")
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