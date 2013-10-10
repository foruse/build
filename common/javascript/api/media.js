(function(Media, NonstaticClass, StaticClass){
this.Voice = (function(Panel, Models, recordCompleteEvent){
	function Voice(){};
	Voice = new StaticClass(Voice, "Bao.API.Media");

	Voice.properties({
		isRecording : false,
		pause : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.pause();
		},
		play : function(id){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.play(id);
		},
		recordStart : function(target){
			if(this.isRecording)
				return;

			var Voice = this;

			if(!Models.VoiceMessage){
				recordCompleteEvent.setEventAttrs({
					src : ""
				});
				recordCompleteEvent.trigger(target);
				return;
			}

			var Voice = this;

			Models.VoiceMessage.record_start(function(src){
				Voice.isRecording = true;

				recordCompleteEvent.setEventAttrs({
					src : src
				});
				recordCompleteEvent.trigger(target);
			});
		},
		recordStop : function(){
			if(!Models.VoiceMessage)
				return;

			if(!this.isRecording)
				return;

			Models.VoiceMessage.record_stop();
			this.isRecording = true;
		},
		save : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.save();
		},
		stop : function(){
			if(!Models.VoiceMessage)
				return;

			Models.VoiceMessage.stop();
		}
	});

	return Voice;
}(
	Bao.API.DOM.Panel,
	window.Models || {},
	// recordCompleteEvent
	new jQun.Event("recordcomplete")
));

Media.members(this);
}.call(
	{},
	Bao.API.Media,
	jQun.NonstaticClass,
	jQun.StaticClass
));