// Works for /index.html?width=10&height=5&seed=9

let solvable = true;
let available = {};
let currentIdx = 0;
let counter = 0;
let previous = null;
let hist = {
  path: []
};
let idx = 0;
let next = 'u';
let score = 0;

let intro = new Audio('pacman_beginning.wav');
let chomp = new Audio('pacman_chomp.wav');
let death = new Audio('pacman_death.wav');
let win = new Audio('pacman_intermission.wav');

document.querySelector('body').innerHTML += '<div class="ready">READY!</div>';

let surrender = 5000;
let exit = (maze.height * maze.width - 1);


let plan = 0;
let pold = plan;
let strategy = [
  ['r', 'd', 'l', 'u'],   // Move toward target
  ['l', 'd', 'r', 'u'],   // Move from NE to center
  ['d', 'r', 'l', 'u'],   // Move from NW center
  ['u', 'r', 'd', 'l'],   // Move from SW toward center
  ['u', 'l', 'r', 'd']    // Move from SE toward center
];

intro.play();

setTimeout( function() {

  document.querySelector('body').removeChild(document.querySelector('.ready'));

  let mute = document.querySelector('#mute');
  mute.addEventListener('click', function(event) {
    let btn = event.currentTarget;
    if (btn.classList.value.indexOf('mute')) {
      chomp.pause();
    } else {
      chomp.play();
    }
    btn.classList.toggle('mute');
  });

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

    // Set strategy
    plan = strategize(idx);

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
    plan = 0;

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

// Was this our last move?
function last(hist, location) {
  let last = hist.path.slice(-1);
  if (last === location) {
    return true;
  }
  return false;
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
// Looks for patterns of 3 to 10 moves
// Analyzes last set of 4 moves (quad) to avoid small box capture
// TODO: Tune to find entrances/exits in large open areas
function pattern(hist, location) {
  for (let len=3; len<10; len++) {
    if (hist.path.length >= len) {
      let quad = hist.path.slice((-len));
      let start = len;
      for (let i=0; i<10; i++) {
        prev = hist.path.slice((-start), (-i));
        start++;
        if (match(quad, prev) && hist.path.includes(location)) {
          statusLog(`Trapped in ${len} block pattern.`);
          return true;
        }
      }
    }
  }
  return false;
}

// Determine which quadrant of the maze we're in
// Switch strategy based on location
function quadrants(location) {
  let result = '';
  let w = maze.width;
  let h = maze.height;
  let w2 = Math.ceil(w/2);
  let h2 = Math.ceil(h/2);
  let r = Math.floor((location/w))+1;
  let c = Math.round((location%w))+1;

  if (r <= h2) {
    result = 'n';
  } else {
    result = 's';
  }

  if (c <= w2) {
    result += 'w';
  } else {
    result += 'e';
  }

  return result;
}

// If we get stuck in a pattern, then move forward and take an alternate route
function recalculate(hist, location) {
  stuck();
  hist.path = [];
}

// Have we been here recently?
function recent(hist, location, direction) {
  let quad = hist.path.slice(-4);
  if (pattern(hist, location)) {
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
    (!options(available, direction) && pattern(hist, location))
  ) {
    stuck();
  }

  // Was this our last location, and do we have alternatives?
  if (last(hist, location) && options(available, direction)) {
    statusLog(' - This was our previous destination');
    return false;
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

// Set status field
function statusLog(message) {
  let status = document.querySelector('#status');
  status.innerHTML += message + '<br />';
  return true;
}

// Select a strategy based on our location
function strategize() {
  let quadrant = quadrants(idx);
  if (quadrant === 'nw') {
    if (pold !== 0) {
      statusLog(` - Changing strategies (${quadrant}): ${strategy[0]}`);
    }
    return 0;
  } else if (quadrant === 'ne') {
    if (pold !== 1) {
      statusLog(` - Changing strategies (${quadrant}): ${strategy[1]}`);
    }
    return 1;
  } else if (quadrant === 'sw') {
    if (pold !== 3) {
      statusLog(` - Changing strategies (${quadrant}): ${strategy[3]}`);
    }
    return 3;
  } else if (quadrant === 'se') {
    if (pold !== 0) {
      statusLog(` - Changing strategies (${quadrant}): ${strategy[0]}`);
    }
    return 0;
  }
  return 0;
}

// If we're stuck, change plans
function stuck() {
  plan = (plan === 0)? 1:0;
  statusLog(` - Changing strategies: ${strategy[plan]}`);
  return true;
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
  statusLog(`It's a traaaap!`);
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
