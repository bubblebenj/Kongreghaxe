package kongreghaxe;
import js.Lib;

/**
 * ...
 * @author bd
 */

@:native ("window.parent.kongregate")
extern class KongregateAPI
{
	public var services : KgServices;
	public var chat		: KgChat;
	public var mtx		: KgMtx;
	public var stats	: KgStats;
	
	/*
	initialize : function ()
	loadAPI : function (a)
	getAPI : function ()
	embedFrame : function (a, b)
	createAnsible : function (a)
	*/
}
