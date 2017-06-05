// Works for /index.html?width=10&height=5&seed=9

var solvable = true;
var available = {};
var currentIdx = 0;
var counter = 0;
var previous = null;
var hist = {
  path: []
};
var idx = 0;
var next = 'u';
let score = 0;

let intro = new Audio('pacman_beginning.wav');
let chomp = new Audio('pacman_chomp.wav');
let death = new Audio('pacman_death.wav');
let win = new Audio('pacman_intermission.wav');

document.querySelector('body').innerHTML += '<div class="ready">READY!</div>';

var surrender = 5000;
var exit = (maze.height * maze.width - 1);

var plan = 0;
var strategy = [
  ['r', 'd', 'u', 'l'],
  ['l', 'u', 'r', 'd'],
  ['r', 'd', 'l', 'u'],
  ['l', 'u', 'd', 'r'],
  ['d', 'r', 'u', 'l']
];

intro.play();

setTimeout( function() {

  document.querySelector('body').removeChild(document.querySelector('.ready'));

  document.body.addEventListener('playbackFinished', function() {
    chomp.pause();
    win.play();
  });

  document.body.addEventListener('cellVisited', function() {
    score ++;
    let html = `1 UP &nbsp;&nbsp;&nbsp; Score: ${Math.round(score/2)}`;
    document.querySelector('#score').innerHTML = html;
  });

  while (solvable && counter < surrender && currentIdx < exit) {

    chomp.play();
    chomp.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    chomp.play();

    cont = true;
    available = maze.getAvailableDirections();
    idx = maze.currentIdx();
    let i = 0;

    // It's a traaaaaaap!
    if (!available || trap() || idx < 0) {
      quit();
    }

    // Using our selected plan, pick the strategic order to follow
    // If our strategy fails, change plan
    for (i=0; i<strategy[plan].length; i++) {
      d = strategy[plan][i];
      if (available && available.hasOwnProperty(d)) {
        n = maze.idxForMove(d);
        if (!should(hist, n, d, available) || previous === n) {
          cont = true;
        } else {
          cont = move(hist, n, d);
          break;
        }
      }
    }

    // Reset the plan each cycle
    // plan = 0;

    previous = currentIdx;
    currentIdx = maze.currentIdx();
    counter++;
  }

  maze.stop(solvable);

}, 4000);

// Keeps track of where we've been
function journal(hist, location, direction) {
  let action = {};
  let visit = visits(hist, location, direction) + 1;
  if (!hist.hasOwnProperty(location)) {
    hist[location] = {};
  }
  hist[location][direction] = visit;
  hist.path.push(location);
  return hist;
}

// Do these arrays match?
function match(a1, a2) {
  return a1.length==a2.length && a1.every(function(v,i) { return v === a2[i]});
}

// Let's take the plunge
function move(hist, location, direction) {
  if (direction === 'l') {
    maze.moveLeft();
  } else if (direction === 'r') {
    maze.moveRight();
  } else if (direction === 'u') {
    maze.moveUp();
  } else if (direction === 'd') {
    maze.moveDown();
  }
  journal(hist, location, direction);
  return false;
}

// Do we have other options?
function options(available, direction) {
  let status = false;
  for (let key in available) {
    if (available.hasOwnProperty(key) && available[key] !== direction) {
      status = true;
    }
  }
  return status;
}

// Have we repeated this pattern?
function pattern(hist, location, len) {
  if (hist.path.length >= len) {
    let quad = hist.path.slice((-len));
    for (let i=0; i<10; i++) {
      prev = hist.path.slice((-len), (-i));
      len++;
      if (match(quad, prev) && hist.path.includes(location)) {
        return true;
      }
    }
  }
  return false;
}

// If we get stuck in a pattern, then move forward and take an alternate route
function recalculate(hist, location) {
  stuck();
  hist.path = [];
}

// Have we been here recently?
function recent(hist, location, direction) {
  let quad = hist.path.slice(-4);
  if (pattern(hist, location, 2) || pattern(hist, location, 3) || pattern(hist, location, 4) || pattern(hist, location, 5) || pattern(hist, location, 6)) {
    recalculate(hist, location);
    return true;
  }else if (quad.includes(location) && repeats(hist, location, direction)) {
    return true;
  }
  return false;
}

function repeats(hist, location, direction) {
  if (hist.hasOwnProperty(location)) {
    if (hist[location].hasOwnProperty(direction)) {
      if (parseInt(hist[location][direction], 10) >= 5) {
        stuck();
        return true;
      }
    }
  }
  return false;
}

// Determines if we should go this route
function should(hist, location, direction, available) {
  let max = 2;
  let status = false;
  let visit = visits(hist, location, direction);

  // Are we stuck?
  if (
    (!options(available, direction) && recent(hist, location, direction)) ||
    (!options(available, direction) && pattern(hist))
  ) {
    stuck();
  }

  // If we've been this way more than once and other options are available, then skip
  if (visit >= max && options(available, direction)) {
    return false;
  }

  // Should we keep going?
  if ((visit < max && !recent(hist, location, direction)) || !options(available, direction)) {
    status = true;
  } else {
    status = false;
  }

  return status;
}

// If we're stuck, change plans
function stuck() {
  return (plan === 0)? 1:0;
}

// Is this a trap?
function trap() {
  if (available) {
    for(let key in available) {
      if (available.hasOwnProperty(key)) {
        return false;
      }
    }
  }
  return true;
}

// Keeps track of the number of visits to each location
function visits(hist, location, direction) {
  let visit = 0;
  if (hist.hasOwnProperty(location)) {
    if (hist[location].hasOwnProperty(direction)) {
      visit = parseInt(hist[location][direction], 10);
    }
  }
  return visit;
}

// Quit trying, it's a Sisyphean task
function quit() {
  console.log("GAME OVER!");
  document.querySelector('body').innerHTML += '<div class="over">GAME OVER</div>';
  chomp.pause();
  death.play();
  maze.stop(false);
  counter = surrender + 1;
}
