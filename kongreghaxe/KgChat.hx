package kongreghaxe;

/**
 * ...
 * @author bd
 */

typedef TabOptions = {
	var size : Float;
}

typedef Size = {
	var width	: Int;
	var height	: Int;
}

@:fakeEnum(String) enum ChatEvent
{ 
	message;
}

@:native("kongregate.chat")
extern class KgChat
{
		
	/**
	 * 
	 * @param	name :	String - Name of the tab
	 * @param	description	: String - Description of the tab
	 * @param	?options : Object - Options for the tab
	 */
	public function showTab(name:String, description:String, ?options:TabOptions) : Void;
	
	/**
	 * 
	 */
	public function closeTab() : Void;
	
	/**
	 * Display chat text
	 * @param	message : String - The message to display
	 * @param	username : String - The username the message should come from
	 */
	public function displayMessage(message:String, username:String) : Void;
	
	/**
	 * Clear the chat dialogue
	 * 
	 */
	public function clearMessages() : Void;
	
	
	/**
	 * Get canvas size
	 * @return the size of the object with properties width and height
	 */
	public function getCanvasSize() : Size;
}