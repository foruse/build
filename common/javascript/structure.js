﻿(function(Namespace, NonstaticClass, StaticClass){
this.Bao = (function(Bao){
	// 以下路径是相对于本文件的路径
	Bao.members({
		API : new Namespace().members({
			Data : new Namespace().members({ // api/data.js
				BatchLoad : null
			}),
			DOM : new Namespace().members({ // api/dom.js
				ChildPanel : null,
				EventCollection : null,
				Panel : null
			}),
			Management : new Namespace().members({ // api/management.js
				History : null,
				IntervalTimer : null,
				Loader : null,
				Timer : null
			})
		}),
		CallServer : null,
		Page : new Namespace().members({
			Index : new Namespace().members({ // ../../pertinence/javascript/index
				Secondary : new Namespace({ // ../../pertinence/javascript/index/secondary.js
					AddProject : null,
					SecondaryPage : null
				}),
				Home : new Namespace({ // ../../pertinence/javascript/index/home.js
					Partner : null,
					Project : null,
					SPP : null,
					Schedule : null,
					Tab : null
				}),
				Share : new Namespace({  // ../../pertinence/javascript/index/ahare.js
					Global : null,
					TitleBar : null
				})
			})
		}),
		Test : new Namespace().members({ 
			DummyData : new Namespace().members({ // ../../test/dummyData
				Generate : new Namespace().members({
					Number : null,
					String : null
				}),
				Index : new Namespace().members({
					Common : null,
					SPP : null
				})
			})
		}),
		UI : new Namespace().members({
			Control : new Namespace().members({ // ui/control
				Drag : new Namespace().members({ // ui/control/drag.js
					Navigator : null,
					Scroll : null
				}),
				List : new Namespace().members({ // ui/control/list.js
					AnchorList : null,
					ProjectAnchorList : null,
					UserAnchorList : null,
					UserList : null
				}),
				Time : new Namespace().members({ // ui/control/time.js
					Calendar : null
				}),
				Wait : new Namespace().members({ // ui/control/wait.js
					LoadingBar : null
				})
			})
		})
	});

	return Bao;
}(
	new Namespace()
));

}.call(
	window,
	jQun.Namespace,
	jQun.NonstaticClass,
	jQun.StaticClass
));