package kongreghaxe;

/**
 * ...
 * @author bd
 */

@:native("kongregate.stats")
extern class KgStats 
{
	/**
	 * Submit statistics
	 * @param	statName: String - The name of the statistic
	 * @param	value: Number - The value to submit (will be converted to an integer)
	 */
	public function submit(statName:String, value:Int) : Void;
}