/*
 monopost
 Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 License: Dual licensed MIT (http://www.opensource.org/licenses/mit-license) & GPL (http://www.opensource.org/licenses/gpl-license)
 Version 0.1.1
 */
(function ( root, factory ) {
  if ( typeof module === "object" && module.exports ) {
    // Node, or CommonJS-Like environments
    module.exports = function(_, Monologue, postal) {
      return factory( _, Monologue, postal);
    }
  } else if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( ["underscore", "monologue", "postal"], function ( _, Monologue, postal ) {
      return factory( _, Monologue, postal, root );
    } );
  } else {
    // Browser globals
    root.Monologue = factory( root._, root.Monologue, root.postal, root );
  }
}( this, function ( _, Monologue, postal, global, undefined ) {

  Monologue.prototype.goPostal = function ( channel, topic ) {
    var pubs;
    var _channel = channel || postal.configuration.DEFAULT_CHANNEL;
    var _topic = topic || "#";
    var bridge = this.__goPostal__ = {};
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

  Monologue.prototype.goLocal = function(options) {
    var bridge = this.__goLocal__ = {};
    _.each(options, function(handlerName, busMeta) {
      if(!this[handlerName]) {
        throw new Error("Cannot bridge via Monologue.prototype.goLocal: Object does not contain a method named " + handlerName + ".");
      } else if(this[handlerName] && ! bridge[busMeta]) {
        var segments = busMeta.split(' ');
        bridge[busMeta] = postal.subscribe({
          channel  : segments.length === 2 ? segments[0] : postal.configuration.DEFAULT_CHANNEL,
          topic    : segments.length === 2 ? segments[1] : segments[0],
          callback : this[handlerName]
        }).withContext(this);
      }
    }, this);
  };

  return Monologue;

} ));