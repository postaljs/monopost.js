(function ( root, factory ) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( ["underscore", "monologue", "postal"], function ( _, Monologue, postal ) {
			return factory( _, root, Monologue, postal );
		} );
	} else {
		// Browser globals
		root.machina = factory( root._, root, root.Monologue, root.postal );
	}
}( this, function ( _, global, Monologue, postal, undefined ) {

	//import("../monopost.js");

} ));