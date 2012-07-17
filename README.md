About
=====
Kongreghaxe is an haxe external lib for the Kongregate API.
Its purpose is to give type safety and full code completion. 

Usage
=====
JS api :
if you use the [kongregate_shell.html](http://developers.kongregate.com/docs/api-overview/client-api "Source page") iframe with the following definition :
``kongregate = kongregateAPI.getAPI();``
then you'll have to "bind it" with the following in haxe environment :
``var kongregate = new kongreghaxe( Reflect.field( js.Lib.window.parent, "kongregate" ) );``

After that you'll have full completion of the API doing :
``kongregate.api.``

Status
======
It is an early version, largely not tested.
At the moment only JS API is provided but AS3 (and maybe AS2) could be made from this lib quite easily.

To Do
=====
Make a basic test project on Kongregate.
test each API function.
AS3 extern