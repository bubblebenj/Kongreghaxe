package kongreghaxe;

/**
 * ...
 * @author bd
 */


typedef PurchaseItem = {
	var identifier	: String;
	var data		: String;
}

typedef Result = {
	var success	: Bool;
}
 
typedef InventoryItem = {
	var id 				: Int;
	var identifier		: String;
	var name			: String;
	var data			: String;
	var remaining_uses	: Int;
}

typedef InventoryList = {
	var success : Bool;
	var data	: Array<InventoryItem>;
}

@:fakeEnum(String) enum PurchaseMethod
{ 
	offers;
	mobile;
} 

@:native("kongregate.mtx")
extern class KgMtx
{
	/**
	 * Requesting Item Purchase
	 * @param	items 	The array of item identifier strings or item/metadata objects {identifier:String,data:"+1str"			
	 * @param	purchaseCallback with a single Object argument which has one field: success
	 */
	@:overload(			function(items:Array<PurchaseItem>,	purchaseCallback:Result->Void):Void{})
	@:overload(			function(items:Array<String>, 		purchaseCallback:Result->Void):Void{})
	public function purchaseItems(items:Array<Dynamic>, 	purchaseCallback:Result->Void):Void;
	
	/**
	 * Requesting User Item Instances
	 * @param	username: The username to request inventory for, or null for the current player.
	 * @param	itemListCallback:  The callback function with a single argument which has two fields:
				 * 	success:Boolean - True if successful
				 * 	data:Array - List of item instance Objects (if successful)
	 */
	public function requestUserItemList(username:String, itemListCallback:InventoryList->Void):Void;
	
	/**
	 * Displaying the Kred Purchase Dialog
	 * @param	purchaseMethod : The purchase method to display. Should be "offers" or "mobile"
	 */
	public function showKredPurchaseDialog(purchaseMethod:PurchaseMethod): Void;
	
	
}