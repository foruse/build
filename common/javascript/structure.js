(function(Namespace, NonstaticClass, StaticClass){
this.Bao = (function(Bao){
	// 以下路径是相对于本文件的路径
	Bao.members({
		API : new Namespace().members({
			Data : new Namespace().members({ // api/data.js
				BatchLoad : null
			}),
			DOM : new Namespace().members({ // api/dom.js
				EventCollection : null,
				Panel : null
			}),
			Manager : new Namespace().members({ // api/manager.js
				History : null,
				IntervalTimer : null,
				Timer : null
			})
		}),
		CallServer : null,
		Page : new Namespace().members({
			Index : new Namespace().members({ // ../../pertinence/javascript/index
				Secondary : new Namespace({ // ../../pertinence/javascript/index/secondary.js
					AddProject : null,
					SecondaryPanel : null
				}),
				SPP : null, // ../../pertinence/javascript/index/spp.js
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