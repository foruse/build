(function(Time, NonstaticClass, Panel, HTML, Event){
this.Calendar = (function(OverflowPanel, panelHtml, dateTableHtml, addMonthEvent){
	function DateTable(selector, date){
		var dateTable = this;

		this.attach({
			userclick : function(e){
				var dateEl = jQun(e.target).between('li[datestatus]', this);

				if(dateEl.length === 0)
					return;

				dateTable.focus(dateEl.get("time", "attr"));
			},
			leaveborder : function(e){
				console.log(333);
			}			
		});
		date.setMonth(date.getMonth() + 1, 0);
		this.focus(date);
		//date.setMonth(date.getMonth()+2, 1);
		//this.focus(date);
	};
	DateTable = new NonstaticClass(DateTable, null, OverflowPanel.prototype);

	DateTable.properties({
		addMonth : function(time){
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
					localString : k.toLocaleDateString(),
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
				time : firstDate.getTime()
			}).appendTo(this[0]);
		},
		clearTable : function(){
			this.save();
			this.innerHTML = "";
		},
		focus : function(time){
			var oldFocusedDateEl = this.find('ol > li.focusedDate');

			time = new Date(time - 0).setHours(0, 0, 0, 0);

			if(oldFocusedDateEl.length > 0){
				// 如果2个日期的时间差小于1天，就证明是同一天(被减的日期是当天的时间00:00)
				if(oldFocusedDateEl.get("time", "attr") == time)
					return;
			}
			
			var focusedDateEl, monthEl;
			
			oldFocusedDateEl.classList.remove("focusedDate");

			focusedDateEl = this.find('ol > li[time="' + time + '"]');
			monthEl = focusedDateEl.parent().parent();

			// 如果月份元素已经聚焦
			if(monthEl.classList.contains("focused")){
				focusedDateEl.classList.add("focusedDate");
				return;
			}

			// 更新月份
			this.updateSiblingMonths(time);
			oldFocusedDateEl.parent().parent().classList.remove("focused");

			// 如果聚焦元素找不到
			if(focusedDateEl.length === 0){
				focusedDateEl = this.find('ol > li[time="' + time + '"]');
				monthEl = focusedDateEl.parent().parent();
			}
			
			monthEl.classList.add("focused");
			focusedDateEl.classList.add("focusedDate");
		},
		restore : function(time){
			// 如果已经存在了，那么从储存的table里取出来，添加至控件下
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
			this.savedTable = this.find(">li");
		},
		savedTable : undefined,
		updateSiblingMonths : function(time){
			var date = new Date(time),
				
				nextMonth = date.getMonth() + 1, year = date.getFullYear();

			// 清空
			this.clearTable();

			for(var i = -1;i < 2;i++){
				/*
					取当前月的下个月的第0天，也就是取当前月的最后一天。如果不这样，大月有31号，小月没有31号，会出错
					正确示例 ：d.setFullYear(2013, 8 + 1 + 1, 0)，取出来的就是2013年9月30日（取10月的第0天，也就是9月最后一天）
					错误示例 ：d.setFullYear(2013, 8 + 1)，取出来的就是2013年10月1日
				*/
				date.setFullYear(year, nextMonth + i, 0);
				this.addMonth(date.getTime());
			}
		}
	});


	function Calendar(){
		this.combine(panelHtml.create());

		new DateTable.constructor(this.find("dd>ul")[0], new Date());
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
				'<dd class="themeBgColor">',
					'<ul></ul>',
				'</dd>',
			'</dl>',
		'</div>'
	].join("")),
	// dateTableHtml
	new HTML([
		'<li time="{time}">',
			'<ol class="inlineBlock">',
				'@for(monthData ->> dt){',
					'<li datestatus="{dt.dateStatus}" time="{dt.time}" localstring="{dt.localString}">{dt.date}</li>',
				'}',
			'</ol>',
			'<p class="whiteFont">',
				'<small>{year}年</small>',
				'<strong>{month}月</strong>',
			'</p>',
		'</li>'
	].join("")),
	// addMonthEvent
	new Event("addmonth")
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