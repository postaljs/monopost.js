describe("When Using Monopost to Bridge monologue to postal", function() {

	var Worker = function(name) {
		this.name = name;
	};
	Worker.prototype.doWork = function() {
		this.emit("work.done", { who: this.name });
	};
	Monologue.mixin(Worker);

	var instance;
	var result;
	var sub;

	describe("With Events Bridged to Default Channel", function(){
		beforeEach(function(){
			instance = new Worker("test123");
			instance.goPostal();
			sub = postal.subscribe({
				topic: "work.*",
				callback: function(d,e){
					result = e;
				}
			});
			instance.doWork();
		});
		afterEach(function(){
			sub.unsubscribe();
			result = undefined;
		});
		it('should bridge events', function(){
			expect( result.channel ).to.be( postal.configuration.DEFAULT_CHANNEL );
			expect( result.topic ).to.be( 'work.done' );
			expect( result ).to.have.property( 'timeStamp' );
			expect( result.data ).to.eql( { who: 'test123' });
		});
	});

	describe("With Events Bridged to a Specific Channel", function(){
		beforeEach(function(){
			instance = new Worker("test123");
			instance.goPostal("test-channel");
			sub = postal.subscribe({
				channel: 'test-channel',
				topic: "work.*",
				callback: function(d,e){
					result = e;
				}
			});
			instance.doWork();
		});
		afterEach(function(){
			sub.unsubscribe();
		});
		it('should bridge events', function(){
			expect( result.channel ).to.be( 'test-channel' );
			expect( result.topic ).to.be( 'work.done' );
			expect( result ).to.have.property( 'timeStamp' );
			expect( result.data ).to.eql( { who: 'test123' });
		});
	});

	describe("With a Specific Event Bridged to a Specific Channel", function(){
		beforeEach(function(){
			instance = new Worker("test123");
			instance.goPostal("test-channel", "work.#");
			sub = postal.subscribe({
				channel: 'test-channel',
				topic: "work.*",
				callback: function(d,e){
					result = e;
				}
			});
			instance.doWork();
			instance.emit("something.else", { msg: "this won't get bridged..." });
		});
		afterEach(function(){
			sub.unsubscribe();
		});
		it('should bridge events', function(){
			expect( result.channel ).to.be( 'test-channel' );
			expect( result.topic ).to.be( 'work.done' );
			expect( result ).to.have.property( 'timeStamp' );
			expect( result.data ).to.eql( { who: 'test123' });
		});
	});

	describe("With a hash map of bridges passed", function(){
		var subB;
		var resultB;
		beforeEach(function(){
			instance = new Worker("test123");
			instance.goPostal({
				"work.#"         : "test-channel",
				"something.else" : "another-channel"
			});
			sub = postal.subscribe({
				channel: 'test-channel',
				topic: "work.*",
				callback: function(d,e){
					result = e;
				}
			});
			subB = postal.subscribe({
				channel: 'another-channel',
				topic: "something.else",
				callback: function(d,e){
					resultB = e;
				}
			});
			instance.doWork();
			instance.emit("something.else", { msg: "this won't get bridged..." });
		});
		afterEach(function(){
			sub.unsubscribe();
		});
		it('should bridge events', function(){
			expect( result.channel ).to.be( 'test-channel' );
			expect( result.topic ).to.be( 'work.done' );
			expect( result ).to.have.property( 'timeStamp' );
			expect( result.data ).to.eql( { who: 'test123' });
			expect( resultB.channel ).to.be( 'another-channel' );
			expect( resultB.topic ).to.be( 'something.else' );
			expect( resultB ).to.have.property( 'timeStamp' );
			expect( resultB.data ).to.eql( { msg: "this won't get bridged..." });
		});
	});
});