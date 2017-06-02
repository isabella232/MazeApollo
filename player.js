// Works for /index.html?width=10&height=5&seed=9

var solvable = true;
var available = {};
var currentIdx = 0;
var counter = 0;
var previous = null;
var hist = [];

while (solvable && counter < maze.height * maze.width && currentIdx < maze.height * maze.width - 1) {
  available = maze.getAvailableDirections();

  // Randomize the next direction
  var rand = getRandomIntInclusive(0,3);

  var dirs = [
    {"dir":"r", "func":"moveRight"},
    {"dir":"l", "func":"moveLeft"},
    {"dir":"u", "func":"moveUp"},
    {"dir":"d", "func":"moveDown"}
  ];

  var idx = maze.currentIdx();

  var i = 0;
  while(i < 4) {
    var d = dirs[rand].dir;
    var n = maze.idxForMove(d);
    console.log(`Next: ${n}`);
    console.log(hist);
    if (
      available[d] &&
      !(idx === 0 && d === 'l') &&
      !(idx === 0 && d === 'u') &&
      !(hist.includes(n)) &&
      !(includesCount(hist, n))
    ) {
      maze[dirs[rand].func]();
      hist.push(idx);
      break;
    }
    i++;
  }

  previous = currentIdx;
  currentIdx = maze.currentIdx();
  counter++;
}

maze.stop(solvable);


function getRandomIntInclusive(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function includesCount(arr, valu) {
  var s = false;
  var x = 0;
  for (var i=0; i < arr.length; i++) {
    if (arr[i] === valu) {
      x++;
    }
  }
  if (x >= 3) {
    s = true;
  }
  return s;
}
