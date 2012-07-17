function FABridge(a, b) {
	this.target = a;
	this.remoteTypeCache = {};
	this.remoteInstanceCache = {};
	this.remoteFunctionCache = {};
	this.localFunctionCache = {};
	this.bridgeID = FABridge.nextBridgeID++;
	this.name = b;
	this.nextLocalFuncID = 0;
	FABridge.instances[this.name] = this;
	FABridge.idMap[this.bridgeID] = this;
	return this
}
FABridge.TYPE_ASINSTANCE = 1;
FABridge.TYPE_ASFUNCTION = 2;
FABridge.TYPE_JSFUNCTION = 3;
FABridge.TYPE_ANONYMOUS = 4;
FABridge.initCallbacks = {};
FABridge.userTypes = {};
FABridge.addToUserTypes = function () {
	for (var a = 0; a < arguments.length; a++)
		FABridge.userTypes[arguments[a]] = {
			typeName : arguments[a],
			enriched : false
		}
};
FABridge.argsToArray = function (a) {
	for (var b = [], d = 0; d < a.length; d++)
		b[d] = a[d];
	return b
};
FABridge.isArray = function (a) {
	return !!a && (a instanceof Array || Object.prototype.toString.call(a) === "[object Array]")
};
FABridge.isASProxy = function (a) {
	return !!a && (a instanceof ASProxy || !!a.bridgeName && !!a.typeName && a.className === "ASProxy")
};
function instanceFactory(a) {
	this.fb_instance_id = a;
	return this
}
function FABridge__invokeJSFunction(a) {
	var b = a[0];
	a = a.concat();
	a.shift();
	return FABridge.extractBridgeFromID(b).invokeLocalFunction(b, a)
}
FABridge.addInitializationCallback = function (a, b) {
	var d = FABridge.instances[a];
	if (d != undefined)
		b.call(d);
	else {
		d = FABridge.initCallbacks[a];
		if (d == null)
			FABridge.initCallbacks[a] = d = [];
		d.push(b)
	}
};
function FABridge__bridgeInitialized(a) {
	var b = document.getElementsByTagName("object"),
	d = b.length,
	j = [];
	if (d > 0)
		for (var h = 0; h < d; h++)
			if (typeof b[h].SetVariable != "undefined")
				j[j.length] = b[h];
	d = document.getElementsByTagName("embed");
	h = d.length;
	b = [];
	if (h > 0)
		for (var q = 0; q < h; q++)
			if (typeof d[q].SetVariable != "undefined")
				b[b.length] = d[q];
	q = j.length;
	d = b.length;
	h = "bridgeName=" + a;
	if (q == 1 && !d || q == 1 && d == 1)
		FABridge.attachBridge(j[0], a);
	else if (d == 1 && !q)
		FABridge.attachBridge(b[0], a);
	else {
		var t = false;
		if (q > 1)
			for (var B =
					0; B < q; B++) {
				for (var F = j[B].childNodes, G = 0; G < F.length; G++) {
					var C = F[G];
					if (C.nodeType == 1 && C.tagName.toLowerCase() == "param" && C.name.toLowerCase() == "flashvars" && C.value.indexOf(h) >= 0) {
						FABridge.attachBridge(j[B], a);
						t = true;
						break
					}
				}
				if (t)
					break
			}
		if (!t && d > 1)
			for (j = 0; j < d; j++)
				if (b[j].attributes.getNamedItem("flashVars").nodeValue.indexOf(h) >= 0) {
					FABridge.attachBridge(b[j], a);
					break
				}
	}
	return true
}
FABridge.nextBridgeID = 0;
FABridge.instances = {};
FABridge.idMap = {};
FABridge.refCount = 0;
FABridge.extractBridgeFromID = function (a) {
	return FABridge.idMap[a >> 16]
};
FABridge.attachBridge = function (a, b) {
	a = new FABridge(a, b);
	FABridge[b] = a;
	var d = FABridge.initCallbacks[b];
	if (d != null) {
		for (var j = 0; j < d.length; j++)
			d[j].call(a);
		delete FABridge.initCallbacks[b]
	}
};
FABridge.blockedMethods = {
	toString : true,
	get : true,
	set : true,
	call : true
};
FABridge.prototype = {
	root : function () {
		return this.deserialize(this.target.getRoot())
	},
	releaseASObjects : function () {
		return this.target.releaseASObjects()
	},
	releaseNamedASObject : function (a) {
		return typeof a != "object" ? false : this.target.releaseNamedASObject(a.fb_instance_id)
	},
	create : function (a) {
		return this.deserialize(this.target.create(a))
	},
	makeID : function (a) {
		return (this.bridgeID << 16) + a
	},
	getPropertyFromAS : function (a, b) {
		if (FABridge.refCount > 0)
			throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
		else {
			FABridge.refCount++;
			retVal = this.target.getPropFromAS(a, b);
			retVal = this.handleError(retVal);
			FABridge.refCount--;
			return retVal
		}
	},
	setPropertyInAS : function (a, b, d) {
		if (FABridge.refCount > 0)
			throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
		else {
			FABridge.refCount++;
			retVal = this.target.setPropInAS(a, b, this.serialize(d));
			retVal = this.handleError(retVal);
			FABridge.refCount--;
			return retVal
		}
	},
	callASFunction : function (a, b) {
		if (FABridge.refCount > 0)
			throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
		else {
			FABridge.refCount++;
			retVal = this.target.invokeASFunction(a, this.serialize(b));
			retVal = this.handleError(retVal);
			FABridge.refCount--;
			return retVal
		}
	},
	callASMethod : function (a, b, d) {
		if (FABridge.refCount > 0)
			throw new Error("You are trying to call recursively into the Flash Player which is not allowed. In most cases the JavaScript setTimeout function, can be used as a workaround.");
		else {
			FABridge.refCount++;
			d = this.encodeJSON(this.serialize(d));
			retVal = this.target.invokeASMethod(a, b, d);
			retVal = this.handleError(retVal);
			FABridge.refCount--;
			return retVal
		}
	},
	invokeLocalFunction : function (a, b) {
		var d;
		a = this.localFunctionCache[a];
		if (a != undefined)
			d = this.serialize(a.apply(null, this.deserialize(b)));
		return d
	},
	getTypeFromName : function (a) {
		return this.remoteTypeCache[a]
	},
	createProxy : function (a, b) {
		b = this.getTypeFromName(b);
		instanceFactory.prototype = b;
		b = new instanceFactory(a);
		return this.remoteInstanceCache[a] =
			b
	},
	getProxy : function (a) {
		return this.remoteInstanceCache[a]
	},
	addTypeDataToCache : function (a) {
		newType = new ASProxy(this, a.name);
		for (var b = a.accessors, d = 0; d < b.length; d++)
			this.addPropertyToType(newType, b[d]);
		a = a.methods;
		for (d = 0; d < a.length; d++)
			FABridge.blockedMethods[a[d]] == undefined && this.addMethodToType(newType, a[d]);
		return this.remoteTypeCache[newType.typeName] = newType
	},
	addPropertyToType : function (a, b) {
		var d = b.charAt(0),
		j;
		if (d >= "a" && d <= "z") {
			j = "get" + d.toUpperCase() + b.substr(1);
			d = "set" + d.toUpperCase() + b.substr(1)
		} else {
			j =
				"get" + b;
			d = "set" + b
		}
		a[d] = function (h) {
			this.bridge.setPropertyInAS(this.fb_instance_id, b, h)
		};
		a[j] = function () {
			return this.bridge.deserialize(this.bridge.getPropertyFromAS(this.fb_instance_id, b))
		}
	},
	addMethodToType : function (a, b) {
		a[b] = function () {
			return this.bridge.deserialize(this.bridge.callASMethod(this.fb_instance_id, b, FABridge.argsToArray(arguments)))
		}
	},
	getFunctionProxy : function (a) {
		var b = this;
		if (this.remoteFunctionCache[a] == null)
			this.remoteFunctionCache[a] = function () {
				b.callASFunction(a, FABridge.argsToArray(arguments))
			};
		return this.remoteFunctionCache[a]
	},
	getFunctionID : function (a) {
		if (a.__bridge_id__ == undefined) {
			a.__bridge_id__ = this.makeID(this.nextLocalFuncID++);
			this.localFunctionCache[a.__bridge_id__] = a
		}
		return a.__bridge_id__
	},
	serialize : function (a) {
		var b = {},
		d = typeof a;
		if (d == "number" || d == "string" || d == "boolean" || d == null || d == "undefined")
			b = a;
		else if (FABridge.isArray(a)) {
			b = [];
			for (d = 0; d < a.length; d++)
				b[d] = this.serialize(a[d])
		} else if (d == "function") {
			b.type = FABridge.TYPE_JSFUNCTION;
			b.value = this.getFunctionID(a)
		} else if (FABridge.isASProxy(a)) {
			b.type =
				FABridge.TYPE_ASINSTANCE;
			b.value = a.fb_instance_id
		} else {
			b.type = FABridge.TYPE_ANONYMOUS;
			b.value = a
		}
		return b
	},
	deserialize : function (a) {
		var b,
		d = typeof a;
		if (d == "number" || d == "string" || d == "boolean" || a == null || a == undefined)
			b = this.handleError(a);
		else if (FABridge.isArray(a)) {
			b = [];
			for (d = 0; d < a.length; d++)
				b[d] = this.deserialize(a[d])
		} else if (d == "object") {
			for (d = 0; d < a.newTypes.length; d++)
				this.addTypeDataToCache(a.newTypes[d]);
			for (var j in a.newRefs)
				this.createProxy(j, a.newRefs[j]);
			if (a.type == FABridge.TYPE_PRIMITIVE)
				b =
					a.value;
			else if (a.type == FABridge.TYPE_ASFUNCTION)
				b = this.getFunctionProxy(a.value);
			else if (a.type == FABridge.TYPE_ASINSTANCE)
				b = this.getProxy(a.value);
			else if (a.type == FABridge.TYPE_ANONYMOUS)
				b = a.value
		}
		return b
	},
	encodeJSON : function (a) {
		var b,
		d,
		j,
		h = "";
		switch (typeof a) {
		case "object":
			if (a)
				if (FABridge.isArray(a)) {
					for (d = 0; d < a.length; ++d) {
						b = this.encodeJSON(a[d]);
						if (h)
							h += ",";
						h += b
					}
					return "[" + h + "]"
				} else if (typeof a.toString != "undefined") {
					for (d in a) {
						b = a[d];
						if (typeof b != "undefined" && typeof b != "function") {
							b = this.encodeJSON(b);
							if (h)
								h += ",";
							h += this.encodeJSON(d) + ":" + b
						}
					}
					return "{" + h + "}"
				}
			return "null";
		case "number":
			return isFinite(a) ? "" + a : "null";
		case "string":
			j = a.length;
			h = '"';
			for (d = 0; d < j; d += 1) {
				b = a.charAt(d);
				if (b >= " ") {
					if (b == "\\" || b == '"')
						h += "\\";
					h += b
				} else
					switch (b) {
					case "\u0008":
						h += "\\b";
						break;
					case "\u000c":
						h += "\\f";
						break;
					case "\n":
						h += "\\n";
						break;
					case "\r":
						h += "\\r";
						break;
					case "\t":
						h += "\\t";
						break;
					default:
						b = b.charCodeAt();
						h += "\\u00" + Math.floor(b / 16).toString(16) + (b % 16).toString(16)
					}
			}
			return h + '"';
		case "boolean":
			return "" + a;
		default:
			return "null"
		}
	},
	addRef : function (a) {
		this.target.incRef(a.fb_instance_id)
	},
	release : function (a) {
		this.target.releaseRef(a.fb_instance_id)
	},
	handleError : function (a) {
		if (typeof a == "string" && a.indexOf("__FLASHERROR") == 0) {
			a = a.split("||");
			FABridge.refCount > 0 && FABridge.refCount--;
			throw new Error(a[1]);
		} else
			return a
	}
};
ASProxy = function (a, b) {
	this.bridge = a;
	this.typeName = b;
	this.className = "ASProxy";
	return this
};
ASProxy.prototype = {
	get : function (a) {
		return this.bridge.deserialize(this.bridge.getPropertyFromAS(this.fb_instance_id, a))
	},
	set : function (a, b) {
		this.bridge.setPropertyInAS(this.fb_instance_id, a, b)
	},
	call : function (a, b) {
		this.bridge.callASMethod(this.fb_instance_id, a, b)
	},
	addRef : function () {
		this.bridge.addRef(this)
	},
	release : function () {
		this.bridge.release(this)
	}
};
function KongregateAPI() {
	this.initialize()
}
KongregateAPI.prototype = {
	initialize : function () {
		this._flashVarsString = "";
		this._flashVarsObject = {};
		this._services = {};
		var a = location.search.split("?")[1];
		if (a) {
			a = a.split("&");
			for (var b = 0; b < a.length; b++) {
				var d = a[b].split("=");
				if (d && d.length == 2) {
					var j = d[0];
					d = d[1];
					if (j.indexOf("kongregate") == 0) {
						this._flashVarsObject[j] = d;
						this._flashVarsString += j + "=" + d + "&"
					}
				}
			}
		}
	},
	flashVarsString : function () {
		return this._flashVarsString
	},
	flashVarsObject : function () {
		return this._flashVarsObject
	},
	getVariable : function (a) {
		return this._flashVarsObject[a]
	},
	loadAPI : function (a) {
		var b = this,
		d = function () {
			for (var j = FABridge.ansible.root(), h = ["services", "stats", "mtx", "chat", "sharedContent"], q = 0; q < h.length; q++) {
				var t = h[q];
				b._services[t] = j.getServices(t)
			}
			typeof a == "function" && a()
		};
		kswfobject.addDomLoadEvent(function () {
			b.createAnsible(d)
		})
	},
	getAPI : function () {
		return this._services
	},
	embedFrame : function (a, b) {
		b = b ? b : "contentdiv";
		b = document.getElementById(b);
		var d = "<iframe id='content' frameborder='0' ";
		d += "style='position:relative;top:0px;left:0px;";
		d += "border:0px none;padding:0px;width:" +
		b.offsetWidth + "px;height:" + b.offsetHeight + "px;'";
		d += "src='" + a + "'></iframe>";
		b.innerHTML = d
	},
	createAnsible : function (a) {
		FABridge.addInitializationCallback("ansible", a);
		a = document.createElement("div");
		a.id = "ansible_container";
		a.style.position = "absolute";
		a.style.width = a.style.height = "1px";
		a.style.left = a.style.top = "-1000px";
		document.body.appendChild(a);
		var b = document.createElement("div");
		b.id = "ansible";
		a.appendChild(b);
		a = {
			bridgeName : "ansible",
			json_encode : "true"
		};
		for (var d in this.flashVarsObject())
			a[d] =
				this.flashVarsObject()[d];
		if ((d = decodeURIComponent(this.getVariable("kongregate_ansible_path"))) && d.indexOf("http://") != 0)
			d = "http://" + d;
		kswfobject.embedSWF(d, "ansible", "1", "1", "9.0.0", null, a, {
			allowScriptaccess : "always"
		}, null, null)
	}
};
kongregateAPI = new KongregateAPI;
var kswfobject = function () {
	function a() {
		if (!z) {
			try {
				var c = m.getElementsByTagName("body")[0].appendChild(A("span"));
				c.parentNode.removeChild(c)
			} catch (e) {
				return
			}
			z = true;
			c = I.length;
			for (var f = 0; f < c; f++)
				I[f]()
		}
	}
	function b(c) {
		if (z)
			c();
		else
			I[I.length] = c
	}
	function d(c) {
		if (typeof s.addEventListener != o)
			s.addEventListener("load", c, false);
		else if (typeof m.addEventListener != o)
			m.addEventListener("load", c, false);
		else if (typeof s.attachEvent != o)
			V(s, "onload", c);
		else if (typeof s.onload == "function") {
			var e = s.onload;
			s.onload =
			function () {
				e();
				c()
			}
		} else
			s.onload = c
	}
	function j() {
		R ? h() : q()
	}
	function h() {
		var c = m.getElementsByTagName("body")[0],
		e = A(u);
		e.setAttribute("type", J);
		var f = c.appendChild(e);
		if (f) {
			var g = 0;
			(function () {
				if (typeof f.GetVariable != o) {
					var l = f.GetVariable("$version");
					if (l) {
						l = l.split(" ")[1].split(",");
						i.pv = [parseInt(l[0], 10), parseInt(l[1], 10), parseInt(l[2], 10)]
					}
				} else if (g < 10) {
					g++;
					setTimeout(arguments.callee, 10);
					return
				}
				c.removeChild(e);
				f = null;
				q()
			})()
		} else
			q()
	}
	function q() {
		var c = K.length;
		if (c > 0)
			for (var e = 0; e < c; e++) {
				var f =
					Unsafe JavaScript attempt to access frame with URL http : //www.kongregate.com/games/hugames/impulse_preview from frame with URL http://impulses-test.hu-games.com/kongregate_shell.html?DO_NOT_SHARE_THIS_LINK=1&kongregate_username=hugames&kongregate_user_id=6533723&kongregate_game_auth_token=065b1aadbbfe16eb75cf9f3fd3227561fb74261e823e3671bbf161ce0c5429ed&kongregate_game_id=130055&kongregate_host=http%3A%2F%2Fwww.kongregate.com&kongregate_game_url=http%3A%2F%2Fwww.kongregate.com%2Fgames%2Fhugames%2Fimpulse&kongregate_api_host=http%3A%2F%2Fapi.kongregate.com&kongregate_channel_id=1341853113707&kongregate_api_path=http%3A%2F%2Fchat.kongregate.com%2Fflash%2FAPI_AS3_5c14b802b05ffc5f732a5f2c768a68bf.swf&kongregate_ansible_path=chat.kongregate.com%2Fflash%2Fansible_986ae6087c4e8c4f3432194cc235b267.swf&kongregate_preview=true&kongregate=true&KEEP_THIS_DATA_PRIVATE=1&preview=true. Domains, protocols and ports must match.
					K[e].id,
				g = K[e].callbackFn,
				l = {
					success : false,
					id : f
				};
				if (i.pv[0] > 0) {
					var n = w(f);
					if (n)
						if (S(K[e].swfVersion) && !(i.wk && i.wk < 312)) {
							H(f, true);
							if (g) {
								l.success = true;
								l.ref = t(f);
								g(l)
							}
						} else {
							B(n);
							g && g(l)
						}
				} else {
					H(f, true);
					if (g) {
						if ((f = t(f)) && typeof f.SetVariable != o) {
							l.success = true;
							l.ref = f
						}
						g(l)
					}
				}
			}
	}
	function t(c) {
		var e = null;
		if ((c = w(c)) && c.nodeName == "OBJECT")
			if (typeof c.SetVariable != o)
				e = c;
			else if (c = c.getElementsByTagName(u)[0])
				e = c;
		return e
	}
	function B(c) {
		if (i.ie && i.win && c.readyState != 4) {
			var e = A("div");
			c.parentNode.insertBefore(e,
				c);
			e.parentNode.replaceChild(F(c), e);
			c.style.display = "none";
			(function () {
				c.readyState == 4 ? c.parentNode.removeChild(c) : setTimeout(arguments.callee, 10)
			})()
		} else
			c.parentNode.replaceChild(F(c), c)
	}
	function F(c) {
		var e = A("div");
		if (i.win && i.ie)
			e.innerHTML = c.innerHTML;
		else if (c = c.getElementsByTagName(u)[0])
			if (c = c.childNodes)
				for (var f = c.length, g = 0; g < f; g++)
					!(c[g].nodeType == 1 && c[g].nodeName == "PARAM") && c[g].nodeType != 8 && e.appendChild(c[g].cloneNode(true));
		return e
	}
	function G(c, e, f) {
		var g,
		l = w(f);
		if (i.wk && i.wk < 312)
			return g;
		if (l) {
			if (typeof c.id == o)
				c.id = f;
			if (i.ie && i.win) {
				var n = "";
				for (var k in c)
					if (c[k] != Object.prototype[k])
						if (k.toLowerCase() == "data")
							e.movie = c[k];
						else if (k.toLowerCase() == "styleclass")
							n += ' class="' + c[k] + '"';
						else if (k.toLowerCase() != "classid")
							n += " " + k + '="' + c[k] + '"';
				k = "";
				for (var p in e)
					if (e[p] != Object.prototype[p])
						k += '<param name="' + p + '" value="' + e[p] + '" />';
				l.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + n + ">" + k + "</object>";
				L[L.length] = c.id;
				g = w(c.id)
			} else {
				p = A(u);
				p.setAttribute("type",
					J);
				for (n in c)
					if (c[n] != Object.prototype[n])
						if (n.toLowerCase() == "styleclass")
							p.setAttribute("class", c[n]);
						else
							n.toLowerCase() != "classid" && p.setAttribute(n, c[n]);
				for (var r in e)
					e[r] != Object.prototype[r] && r.toLowerCase() != "movie" && C(p, r, e[r]);
				l.parentNode.replaceChild(p, l);
				g = p
			}
		}
		return g
	}
	function C(c, e, f) {
		var g = A("param");
		g.setAttribute("name", e);
		g.setAttribute("value", f);
		c.appendChild(g)
	}
	function T(c) {
		var e = w(c);
		if (e && e.nodeName == "OBJECT")
			if (i.ie && i.win) {
				e.style.display = "none";
				(function () {
					e.readyState ==
					4 ? W(c) : setTimeout(arguments.callee, 10)
				})()
			} else
				e.parentNode.removeChild(e)
	}
	function W(c) {
		if (c = w(c)) {
			for (var e in c)
				if (typeof c[e] == "function")
					c[e] = null;
			c.parentNode.removeChild(c)
		}
	}
	function w(c) {
		var e = null;
		try {
			e = m.getElementById(c)
		} catch (f) {}
		
		return e
	}
	function A(c) {
		return m.createElement(c)
	}
	function V(c, e, f) {
		c.attachEvent(e, f);
		D[D.length] = [c, e, f]
	}
	function S(c) {
		var e = i.pv;
		c = c.split(".");
		c[0] = parseInt(c[0], 10);
		c[1] = parseInt(c[1], 10) || 0;
		c[2] = parseInt(c[2], 10) || 0;
		return e[0] > c[0] || e[0] == c[0] && e[1] > c[1] ||
		e[0] == c[0] && e[1] == c[1] && e[2] >= c[2] ? true : false
	}
	function U(c, e, f, g) {
		if (!(i.ie && i.mac)) {
			var l = m.getElementsByTagName("head")[0];
			if (l) {
				f = f && typeof f == "string" ? f : "screen";
				if (g)
					Q = v = null;
				if (!v || Q != f) {
					g = A("style");
					g.setAttribute("type", "text/css");
					g.setAttribute("media", f);
					v = l.appendChild(g);
					if (i.ie && i.win && typeof m.styleSheets != o && m.styleSheets.length > 0)
						v = m.styleSheets[m.styleSheets.length - 1];
					Q = f
				}
				if (i.ie && i.win)
					v && typeof v.addRule == u && v.addRule(c, e);
				else
					v && typeof m.createTextNode != o && v.appendChild(m.createTextNode(c +
							" {" + e + "}"))
			}
		}
	}
	function H(c, e) {
		if (X) {
			e = e ? "visible" : "hidden";
			if (z && w(c))
				w(c).style.visibility = e;
			else
				U("#" + c, "visibility:" + e)
		}
	}
	var o = "undefined",
	u = "object",
	J = "application/x-shockwave-flash",
	s = window,
	m = document,
	x = navigator,
	R = false,
	I = [j],
	K = [],
	L = [],
	D = [],
	z = false,
	v,
	Q,
	X = true,
	i = function () {
		var c = typeof m.getElementById != o && typeof m.getElementsByTagName != o && typeof m.createElement != o,
		e = x.userAgent.toLowerCase(),
		f = x.platform.toLowerCase(),
		g = f ? /win/.test(f) : /win/.test(e);
		f = f ? /mac/.test(f) : /mac/.test(e);
		e = /webkit/.test(e) ?
			Unsafe JavaScript attempt to access frame with URL http : //www.kongregate.com/games/hugames/impulse_preview from frame with URL http://impulses-test.hu-games.com/kongregate_shell.html?DO_NOT_SHARE_THIS_LINK=1&kongregate_username=hugames&kongregate_user_id=6533723&kongregate_game_auth_token=065b1aadbbfe16eb75cf9f3fd3227561fb74261e823e3671bbf161ce0c5429ed&kongregate_game_id=130055&kongregate_host=http%3A%2F%2Fwww.kongregate.com&kongregate_game_url=http%3A%2F%2Fwww.kongregate.com%2Fgames%2Fhugames%2Fimpulse&kongregate_api_host=http%3A%2F%2Fapi.kongregate.com&kongregate_channel_id=1341853113707&kongregate_api_path=http%3A%2F%2Fchat.kongregate.com%2Fflash%2FAPI_AS3_5c14b802b05ffc5f732a5f2c768a68bf.swf&kongregate_ansible_path=chat.kongregate.com%2Fflash%2Fansible_986ae6087c4e8c4f3432194cc235b267.swf&kongregate_preview=true&kongregate=true&KEEP_THIS_DATA_PRIVATE=1&preview=true. Domains, protocols and ports must match.
			parseFloat(e.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false;
		var l = ! + "\u000b1",
		n = [0, 0, 0],
		k = null;
		if (typeof x.plugins != o && typeof x.plugins["Shockwave Flash"] == u) {
			if ((k = x.plugins["Shockwave Flash"].description) && !(typeof x.mimeTypes != o && x.mimeTypes[J] && !x.mimeTypes[J].enabledPlugin)) {
				R = true;
				l = false;
				k = k.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				n[0] = parseInt(k.replace(/^(.*)\..*$/, "$1"), 10);
				n[1] = parseInt(k.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				n[2] = /[a-zA-Z]/.test(k) ? parseInt(k.replace(/^.*[a-zA-Z]+(.*)$/, "$1"),
						10) : 0
			}
		} else if (typeof s.ActiveXObject != o)
			try {
				var p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				if (p)
					if (k = p.GetVariable("$version")) {
						l = true;
						k = k.split(" ")[1].split(",");
						n = [parseInt(k[0], 10), parseInt(k[1], 10), parseInt(k[2], 10)]
					}
			} catch (r) {}
			
		return {
			w3 : c,
			pv : n,
			wk : e,
			ie : l,
			win : g,
			mac : f
		}
	}
	();
	(function () {
		if (i.w3) {
			if (typeof m.readyState != o && m.readyState == "complete" || typeof m.readyState == o && (m.getElementsByTagName("body")[0] || m.body))
				a();
			if (!z) {
				typeof m.addEventListener != o && m.addEventListener("DOMContentLoaded",
					a, false);
				if (i.ie && i.win) {
					m.attachEvent("onreadystatechange", function () {
						if (m.readyState == "complete") {
							m.detachEvent("onreadystatechange", arguments.callee);
							a()
						}
					});
					s == top && function () {
						if (!z) {
							try {
								m.documentElement.doScroll("left")
							} catch (c) {
								setTimeout(arguments.callee, 0);
								return
							}
							a()
						}
					}
					()
				}
				i.wk && function () {
					z || (/loaded|complete/.test(m.readyState) ? a() : setTimeout(arguments.callee, 0))
				}
				();
				d(a)
			}
		}
	})();
	(function () {
		i.ie && i.win && window.attachEvent("onunload", function () {
			for (var c = D.length, e = 0; e < c; e++)
				D[e][0].detachEvent(D[e][1],
					D[e][2]);
			c = L.length;
			for (e = 0; e < c; e++)
				T(L[e]);
			for (var f in i)
				i[f] = null;
			i = null;
			for (var g in kswfobject)
				kswfobject[g] = null;
			kswfobject = null
		})
	})();
	return {
		embedSWF : function (c, e, f, g, l, n, k, p, r, M) {
			var N = {
				success : false,
				id : e
			};
			if (i.w3 && !(i.wk && i.wk < 312) && c && e && f && g && l) {
				H(e, false);
				b(function () {
					f += "";
					g += "";
					var E = {};
					if (r && typeof r === u)
						for (var y in r)
							E[y] = r[y];
					E.data = c;
					E.width = f;
					E.height = g;
					y = {};
					if (p && typeof p === u)
						for (var O in p)
							y[O] = p[O];
					if (k && typeof k === u)
						for (var P in k)
							if (typeof y.flashvars != o)
								y.flashvars += "&" +
								P + "=" + k[P];
							else
								y.flashvars = P + "=" + k[P];
					if (S(l)) {
						O = G(E, y, e);
						E.id == e && H(e, true);
						N.success = true;
						N.ref = O
					} else
						H(e, true);
					M && M(N)
				})
			} else
				M && M(N)
		},
		ua : i,
		removeSWF : function (c) {
			i.w3 && T(c)
		},
		createCSS : function (c, e, f, g) {
			i.w3 && U(c, e, f, g)
		},
		addDomLoadEvent : b,
		addLoadEvent : d
	}
}
();
