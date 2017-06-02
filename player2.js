// Works for /index.html?width=10&height=5&seed=9

var solvable = true;
var available = {};
var currentIdx = 0;
var counter = 0;
var previous = null;
var hist = [];
var idx = 0;
var next = 'u';

var surrender = 5000;
var exit = (maze.height * maze.width - 1);

while (solvable && counter < surrender && currentIdx < exit) {

  cont = true;
  available = maze.getAvailableDirections();
  idx = maze.currentIdx();

  // Go right
  if (available.r) {
    n = maze.idxForMove('r');
    if (!includesFewerThan(hist, n) || previous === n) {
      cont = true;
    } else {
      maze.moveRight();
      hist.push(idx);
      cont = false;
    }
  }

  // Go down
  if (available.d && cont) {
    n = maze.idxForMove('d');
    if (!includesFewerThan(hist, n) || previous === n) {
      cont = true;
    } else {
      maze.moveDown();
      hist.push(idx);
      cont = false;
    }
  }

  // If we're making a decision about UP vs. LEFT, check to see which has happened
  // more frequently before making a choice

  if (available.u || available.l) {

    mu = maze.idxForMove('u');
    su = includesFewerThan(hist, mu);
    cu = timesVisited(hist, mu);
    ml = maze.idxForMove('l');
    sl = includesFewerThan(hist, ml);
    cl = timesVisited(hist, ml);

    if (cu >= cl && available.l || !available.u) {
      next = 'l';
    } else if (cu <= cl && available.u || !available.l) {
      next = 'u';
    }

  }

  if (available.u && cont && next === 'u') {
    n = maze.idxForMove('u');
    if (!includesFewerThan(hist, n) || previous === n) {
      cont = true;
    } else {
      maze.moveUp();
      hist.push(idx);
      cont = false;
    }
  }

  if (available.l && cont && next === 'l') {
    n = maze.idxForMove('l');
    if (!includesFewerThan(hist, n) || previous === n) {
      cont = true;
    } else {
      maze.moveLeft();
      hist.push(idx);
      cont = false;
    }
  }

  previous = currentIdx;
  currentIdx = maze.currentIdx();
  counter++;
}

maze.stop(solvable);


function numAvailableDirections() {
  var count = 0;
  var available = maze.getAvailableDirections();
  for(key in available) {
    if (available[key]) {
      count++;
    }
  }
  return count;
}


function timesVisited(arr, valu) {
  var count = 0;
  for (var i=0; i < arr.length; i++) {
    if (arr[i] === valu) {
      count++;
    }
  }
  return count;
}


function includesFewerThan(arr, valu) {
  var status = true;
  var count = 0;
  var total = numAvailableDirections() + 3;
  for (var i=0; i < arr.length; i++) {
    if (arr[i] === valu) {
      count++;
    }
  }
  if (count >= total) {
    status = false;
  }
  return status;
}
