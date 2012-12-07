var _ = require('underscore');
var postal = require('postal');
var Monologue = require('monologue.js');
var bridge = require('../../lib/monopost.js');

bridge(_, Monologue, postal);

var Worker = function(name) {
	this.name = name;
};
Worker.prototype.doWork = function() {
	this.emit("work.done", { who: this.name });
};
Monologue.mixin(Worker);

postal.addWireTap(function(d, e){
	console.log(e);
});

var instanceA = new Worker("YayWorker");
instanceA.goPostal("OnTheBusNowFolks");
instanceA.doWork();