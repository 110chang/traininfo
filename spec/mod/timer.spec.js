
/*
 *    Spec/Mod/Timer
 */

var Timer = require('../../src/mod/timer');

var timer;
var duration = 1000;
var fps = 6;
var repeatCount = 2;

describe('Timer', function() {

  beforeEach(function() {
    timer = new Timer(duration, fps, repeatCount);
  });

  it('could create instance', function(){
    expect(timer instanceof Timer).toBeTruthy();
  });

  it('should initialize correctly', function(){
    expect(timer.duration).toBe(duration);
    expect(timer.fps).toBe(fps);
    expect(timer.repeat).toBe(repeatCount);
  });

  it('could initialize again', function(){
    timer.initialize(500, 12, 3);
    expect(timer.duration).toBe(500);
    expect(timer.fps).toBe(12);
    expect(timer.repeat).toBe(3);

    timer.initialize();
    expect(timer.duration).toBe(500);
    expect(timer.fps).toBe(12);
    expect(timer.repeat).toBe(3);
  });
});

describe('Timer Async', function() {
  var startTime = 0;
  var stopTime = 0;
  var lap = [];

  beforeEach(function(done) {

    lap = [];
    
    timer = new Timer(duration, fps, repeatCount);
    timer.on(Timer.TIMER_START, function(e) {
      startTime = e.time;
    });
    timer.on(Timer.TIMER, function(e) {
      lap.push(e.time);
    });
    timer.on(Timer.TIMER_STOP, function(e) {
      stopTime = e.time;
      done();
    });
    timer.start();
  });

  it('could start timer', function(){
    //console.log(startTime);
    expect(startTime).toBeGreaterThan(0);
    expect(startTime).toBeLessThan((new Date()).getTime());
  });

  it('could lap timer', function(){
    //console.log(lap);
    expect(lap.length).toEqual(repeatCount);
  });

  it('could stop timer', function(){
    //console.log(stopTime);
    expect(stopTime).toBeGreaterThan(startTime);
    expect(stopTime).toBeCloseTo(startTime + duration * repeatCount, -3);
  });
});

