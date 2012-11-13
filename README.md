# monopost.js - v0.1.0

## What is it?
[monopost](https://github.com/ifandelse/monopost.js) is an adapter that bridges [monologue.js](https://github.com/ifandelse/monologue.js) - an event emitter utility - to [postal.js](https://github.com/ifandelse/postal.js) - a JavaScript message bus. In a nutshell, monologue is to the observer pattern, as postal is to the mediator pattern. monopost adds an additional method to monologue's prototype that makes bridging events to the message bus very simple.

## How do I use it?

#### Including it in your project
First things first - monopost has three dependencies: underscore, postal and monologue.

If you are using it in the browser, simply include monopost.js (it can act as a standard include or an AMD module).  If you're not using an AMD loader, you will need to include monopost *after* its dependencies.  If you are using it in node, the monopost.js module returns a function which takes underscore, monologue and postal as arguments.  This function must be invoked before monopost will take effect:

```javascript
var _ = require('underscore');
var postal = require('postal');
var Monologue = require('monologue.js');
var bridge = require('monopost');

bridge(_, Monologue, postal);
```

#### How to bridge events

Let's pretend we have a simple constructor function that is taking advantage of monologue's behavior:

```javascript
var Worker = function(name) {
    this.name = name;
};
Worker.prototype.doWork = function() {
    this.emit("work.done", { who: this.name });
};
Monologue.mixin(Worker);

var worker = new Worker("Bugs");
```

Assuming monopost has been included in the project, the `goPostal` method (yes, we went there) will now be available on any object that has monologue mixed into it.  The `goPostal` method has 4 different ways it can be called:

```javascript

// 1.) with no arguments. This bridges ALL events to the default postal channel "/"
worker.goPostal();

// 2.) with a channel name. This bridges all events to the specified channel in postal
worker.goPostal("SomeChannel");

// 3.) with a channel & topic binding. This bridges only events matching the specified
//     topic binding, and publishes them to postal on the channel provided
worker.goPostal("SomeChannel", "work.#"); // will match work.done, work.started, work.almost.done, etc.

// 4.) with an object literal providing key/value pairs of topic binding/channel
worker.goPostal({
    "match.stuff.like.#" : "ThisChannelYo",
    "secret.sauce.*"     : "SeeecretChannel",
    "another.*.topic"    : "YayMoarChannelsChannel"
});
```

Any events that have been bridged will also be published to postal's message bus when the event is emitted.

## Why would I use it?
People often use the term "pub/sub" to describe eventing in general. However, there is an observer pattern based 'pub/sub' - where listeners must have a direct reference to what they are subscribing - and a mediator pattern 'pub/sub' - where subscribers and publishers use a 3rd party 'broker' to manage the list of subscribers, and the routing of messages to the correct listeners, etc.  Both patterns are important, and have different implications. For objects that truly should have a direct reference to one another, the 'observer' pattern makes sense (and a mediated approach might truly be overkill in those instances). This is where monologue comes into play - making objects event emitters for other subscribers to subscribe directly. However, it's often the case that other objects (in separate modules) in the application need to know about an event that has occurred - but those objects would have to take a direct dependency on the publishing object only to get a handle to subscribe.  This is where postal comes into play - it acts as a mediator so that your modules do not have to become tightly coupled simply to listen to events that are important beyond the modules that publish them. Using both patterns in an application is a very common scenario, and you typically see boilerplate code where a subscriber is added to an event emitter in order to bridge the event to the bus:

```javascript
// example of the kind of boilerplate cruft requred to manually bridge most emitters to a bus
// uuuuugly. Too much of this in an app and you'll want to scratch your eyes out...
someObject.on("someEvent", function(arg1, arg2){
    bus.publish({
        channel: "someChannel",
        topic: "someEvent",
        data: {
            arg1: arg1,
            arg2: arg2
        }
    })
});
```

**The point of monopost is to make the above boilerplate disappear.** Since monologue and postal share the same envelope structure (except that postal's envelope has the additional `channel` member), bridging the two is quite simple (as seen in the examples further above).

You've probably noticed that monologue uses a 'single object payload' style for passing arguments to subscribers, as opposed to the '0-to-n arguments' approach most event emitters take. See [monologue's README](https://github.com/ifandelse/monologue.js) for more discussion behind the reason(s) for this approach.

