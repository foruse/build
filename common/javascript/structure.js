(function(Namespace, NonstaticClass, StaticClass){

this.Bao = (function(Bao){
	// 以下路径是相对于本文件的路径
	Bao.members({
		API : new Namespace().members({
			Manager : new Namespace().members({ // api/manager.js
				Timer : null
			})
		}),
		CallServer : jQun.Ajax,
		Page : new Namespace().members({
			Index : new Namespace().members({ // ../../pertinence/javascript/index
				History : null, // ../../pertinence/javascript/index/index.js
				SPP : new Namespace().members({ // ../../pertinence/javascript/index/spp.js
					Partner : null,
					Project : null,
					Schedule : null
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
					Scroll : null
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