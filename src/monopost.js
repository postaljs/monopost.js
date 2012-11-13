Monologue.prototype.goPostal = function ( channel, topic ) {
	var pubs;
	var _channel = channel || postal.configuration.DEFAULT_CHANNEL;
	var _topic = topic || "#";
	var bridge = this.__postal__ = {};
	if ( Object.prototype.toString.call( channel ) === "[object String]" || arguments.length === 0 ) {
		pubs = [
			{ channel : _channel, topic : _topic }
		];
	} else if ( typeof channel === "object" ) {
		pubs = _.reduce( channel, function ( memo, channel, topic ) {
			memo.push( { channel : channel, topic : topic } );
			return memo;
		}, [] );
	}
	_.each( pubs, function ( item ) {
		bridge[item.topic] = this.on( item.topic, function ( d, e ) {
			var envelope = _.extend( {}, e, { channel : item.channel } );
			postal.publish( envelope );
		} );
	}, this );
};