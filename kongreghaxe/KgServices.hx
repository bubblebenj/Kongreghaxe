package kongreghaxe;

/**
 * ...
 * @author bd
 */

typedef KgMessage = {
	var content : String;
}

typedef KgFeedPost = {
	var content		: String;
	var image_uri	: String;
	var kv_params	: Dynamic;
}

@:fakeEnum(String) enum InvitationFilter
{ 
	played;
	not_played;
} 

typedef KgInvitation = {
	var content		: String;
	var filter		: InvitationFilter;
	var kv_params	: Dynamic;
}

@:native("kongregate.services")
extern class KgServices
{
	/* Authentication API*/
	
	/**
	 * Display the registration UI
	 * 
	 */
	public function showRegistrationBox() : Void;
	
	/**
	 * Getting the player's game authentication token
	 * @return game authentication token
	 */
	public function getGameAuthToken() : String;
	
	/**
	 * Check if the user is a guest
	 * @return 'true' if the player is currently signed into Kongregate else return 'false'
	 */
	public function isGuest() : Bool;
	
	/**
	 * Get the player's Kongregate username
	 * @return String : username
	 */
	public function getUsername() : String;
	
	/**
	 * Get the player's Kongregate user id
	 * Please note that to securely authenticate a player, you should use the server-side (JSON) authentication API.
	 * @return String : User id
	 */
	public function getUserId() : String;
	
	/**
	 * Sending a Message
	 * @param	message
	 */
	public function privateMessage( message : KgMessage ) : Void;
	
	/**
	 * Resizing the enclosing iframe
	 * @param	x : width size of the iframe in pixel
	 * @param	y : height size of the iframe in pixel
	 */
	public function resizeGame(x:Int, y:Int) : Void;
	
	
	/**
	 * Making a Feed Post
	 * @param	message : either a String or KgFeedPost
	 */
	@:overload(				function( message : String ) : Void{})
	public function showFeedPostBox( message : KgFeedPost ) : Void;
	
	/**
	 * Show an Invitation Box
	 * @param	content : either a String or KgInvitation
	 */
	@:overload(				function( content : KgMessage):Void{})
	public function showInvitationBox( content : KgInvitation) : Void;
	
	/**
	 * Display a shout box with preset message
	 * @param initialMessage A string containing the message to display
	 */
	public function showShoutBox(initialMessage : String) : Void;

}