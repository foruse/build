(function(Manager, NonstaticClass){
this.Timer = (function(setTimeout, clearTimeout){
	function Timer(){};
	Timer = new NonstaticClass(Timer, "Timer");

	Timer.properties({
		stop : function(_onbreak){
			///	<summary>
			///	停止计时器。
			///	</summary>
			///	<param name="_onbreak" type="function">如果未超时就被停止，那么会执行这个中断函数，否则不会执行。</param>
			var index = this.index;

			this.isEnabled = false;

			// 如果计时器已运行，说明已超时，则return
			if(index === -1)
				return;

			// 清除计时器
			clearTimeout(index);
			this.index = -1;

			if(typeof _onbreak === "function"){
				_onbreak();
			}
		},
		index : -1,
		isEnabled : false,
		start : function(_timeout, _ontimeout){
			///	<summary>
			///	开始计时器，该计时器需要人为手动停止。
			///	</summary>
			///	<param name="_timeout" type="number">超时时间，单位毫秒。</param>
			///	<param name="_ontimeout" type="function">超时所执行的函数。</param>

			// 如果已经开始，则return
			if(this.isEnabled)
				return;

			this.assign({
				index : -1,
				isEnabled : true
			});

			// 设置计时器
			this.index = setTimeout(function(){
				this.index = -1;

				if(!_ontimeout)
					return;

				_ontimeout();
			}.bind(this), _timeout || 200);
		}
	});

	return Timer.constructor;
}(
	// setTimeout
	setTimeout,
	// clearTimeout
	clearTimeout
));

Manager.members(this);
}.call(
	{},
	Bao.API.Manager,
	jQun.NonstaticClass
));