describe("When Using Monopost to Bridge postal to local methods", function() {

	var Worker = function(name) {
		this.name = name;
	};
	Worker.prototype.doWork = function(data) {
		this.emit("work.done", { who: this.name, msg: data });
	};
	Monologue.mixin(Worker);

	var instance;
	var result;
	var sub;

	describe("With the default channel by providing only a topic", function(){
		beforeEach(function(){
			instance = new Worker("test123");
			instance.goLocal({
        "do.some.work" : "doWork"
      });
			instance.on("work.done", function(data, envelope) {
        result = envelope;
      });
      postal.publish({
        channel : postal.configuration.DEFAULT_CHANNEL,
        topic   : "do.some.work",
        data    : "worky work work"
      });
		});
		afterEach(function(){
			postal.utils.reset();
			result = undefined;
		});
		it('should fire handler', function(){
      expect( result.data.who).to.be("test123");
      expect( result.data.msg).to.be("worky work work");
			expect( result.topic ).to.be( 'work.done' );
			expect( result ).to.have.property( 'timeStamp' );
		});
	});

  describe("With a specific channel and topic", function(){
    beforeEach(function(){
      instance = new Worker("test456");
      instance.goLocal({
        "job do.some.work" : "doWork"
      });
      instance.on("work.done", function(data, envelope) {
        result = envelope;
      });
      postal.publish({
        channel : "job",
        topic   : "do.some.work",
        data    : "worky worky work"
      });
    });
    afterEach(function(){
      postal.utils.reset();
      result = undefined;
    });
    it('should fire handler', function(){
      expect( result.data.who).to.be("test456");
      expect( result.data.msg).to.be("worky worky work");
      expect( result.topic ).to.be( 'work.done' );
      expect( result ).to.have.property( 'timeStamp' );
    });
  });

  describe("With more than one handler and subscription", function(){
    var result2;
    beforeEach(function(){
      instance = new Worker("test456");
      instance.anotherMethod = function(data) {
        this.emit("more.work", { msg: data });
      };
      instance.goLocal({
        "job do.some.work"   : "doWork",
        "moar do.moar.worky" : "anotherMethod"
      });
      instance.on("work.done", function(data, envelope) {
        result = envelope;
      });
      instance.on("more.work", function(data, envelope) {
        result2 = envelope;
      });
      postal.publish({
        channel : "job",
        topic   : "do.some.work",
        data    : "worky worky work"
      });
      postal.publish({
        channel : "moar",
        topic   : "do.moar.worky",
        data    : "hi ho, hi ho"
      });
    });
    afterEach(function(){
      postal.utils.reset();
      result = undefined;
    });
    it('should fire handler', function(){
      expect( result.data.who).to.be("test456");
      expect( result.data.msg).to.be("worky worky work");
      expect( result.topic ).to.be( 'work.done' );
      expect( result ).to.have.property( 'timeStamp' );
      expect( result2.data.msg).to.be("hi ho, hi ho");
    });
  });
});