
var PROBABILITY = 0.6;

class Maze {
  constructor(height = 50, width = 100) {
    this.data = { cells: [] }
    this.height = parseInt(height, 10);
    this.width = parseInt(width, 10);
    this.createData();
    this.parseMazeData();
    this.moves = [0];
    this.commitMove(0);
    this.playBackIdx = 1;
  }

  createData() {
    for (var i = 1; i < this.height * this.width + 1; i++) {
      this.data.cells.push(this.createCellData(i));
    }
  }

  createCellData(idx) {
    return {
      u: this.upData(idx),
      r: this.rightData(idx),
      d: this.downData(idx),
      l: this.leftData(idx)
    }
  }

  upData(idx) {
    return (idx < this.width + 1) ? false : this.data["cells"][idx - this.width - 1].d;
  }

  rightData(idx) {
    var isLast = idx === this.height * this.width;
    if (isLast) {
      return true;
    }

    return (idx % this.width === 0) ? false : Math.random() <= PROBABILITY;
  }

  downData(idx) {
    return (idx > (this.height - 1) * this.width) ? false : Math.random() <= PROBABILITY;
  }

  leftData(idx) {
    var isFirst = idx === 1;
    if (isFirst) {
      return true;
    }

    return (idx % this.width === 1) ? false : this.data["cells"][idx - 2].r;
  }

  setupStyling() {
    var style = document.createElement('style');
    style.type = 'text/css';

    var cellWidth = 100 / this.width * 0.8;
    var borderWidth = 100 / this.width * 0.1;

    style.innerHTML = '.node { width: ' + cellWidth + 'vw; height: ' + cellWidth + 'vw; border: ' + borderWidth + 'vw solid #DDD; }';
    style.innerHTML += ' .top { border-top: ' + borderWidth + 'vw solid #CCC; }';
    style.innerHTML += ' .right { border-right: ' + borderWidth + 'vw solid #CCC; }';
    style.innerHTML += ' .bottom { border-bottom: ' + borderWidth + 'vw solid #CCC; }';
    style.innerHTML += ' .left { border-left: ' + borderWidth + 'vw solid #CCC; }';

    var head = document.getElementsByTagName('head')[0];
    head.insertBefore(style, head.firstChild);
  }

  parseMazeData() {
    this.setupStyling();

    var cells = this.data["cells"];

    for (var idx in cells) {
      var cellObj = cells[idx]
      var node = this.createNode(cellObj);
      node.id = idx;
      this.addNode(node);
    }
  }

  createNode(cellObj) {
    var node = document.createElement("div");
    var className = "node"

    if (!cellObj.u) {
      className += " top";
    }

    if (!cellObj.r) {
      className += " right";
    }

    if (!cellObj.d) {
      className += " bottom";
    }

    if (!cellObj.l) {
      className += " left";
    }

    node.className = className;
    return node
  }

  addNode(node) {
    var maze = document.getElementById("maze");
    maze.appendChild(node);
  }

  commitMove(destinationIdx) {
    console.log("MOVE " + this.moves.length + ": " + destinationIdx)
  }

  isAdjacent(destinationIdx) {
    var currentIdx = this.currentIdx()
    return destinationIdx === currentIdx + 1 || destinationIdx === currentIdx + 1 + this.width || destinationIdx === currentIdx - 1 || destinationIdx === currentIdx - this.width - 1;
  }

  move(destinationIdx) {
    this.commitMove(destinationIdx);
    this.moves.push(destinationIdx);

    if (destinationIdx === this.height * this.width - 1) {
      this.stop(true);
      console.log("******************** SOLVED ********************")
    }

    return destinationIdx;
  }

  playBackNextMove(playBackIdx) {

    if (playBackIdx > 0) {
      var currentIdx = this.moves[playBackIdx - 1];
      var currentNode = document.getElementById("" + currentIdx);
      currentNode.className = currentNode.className.replace("current", "");
    }

    var destinationIdx = this.moves[playBackIdx];
    var destinationNode = document.getElementById("" + destinationIdx)
    destinationNode.className += " current";

    var that = this;
    if (this.moves.length > playBackIdx + 1) {
      setTimeout(function() {
        that.playBackNextMove(playBackIdx + 1);
      }, 300);
    }
  }

// PUBLIC FUNCTIONS

  currentIdx() {
    return this.moves[this.moves.length - 1];
  }

  getAvailableDirections() {
    return this.data["cells"][this.currentIdx()];
  }

  idxForMove(direction) {
    var currentIdx = this.currentIdx();

    switch (direction) {
      case "u":
        return currentIdx - this.width;
      case "r":
        return currentIdx + 1;
      case "d":
        return currentIdx + this.width;
      case "l":
        return currentIdx - 1;
      default:
        return currentIdx;
    }
  }

  moveUp() {
    if (this.getAvailableDirections().u) {
      var destinationIdx = this.currentIdx() - this.width;
      return this.move(destinationIdx);
    } else {
      return this.currentIdx();
    }
  }

  moveRight() {
    if (this.getAvailableDirections().r) {
      var destinationIdx = this.currentIdx() + 1;
      return this.move(destinationIdx);
    } else {
      return this.currentIdx();
    }
  }

  moveDown() {
    if (this.getAvailableDirections().d) {
      var destinationIdx = this.currentIdx() + this.width;
      return this.move(destinationIdx);
    } else {
      return this.currentIdx();
    }
  }

  moveLeft() {
    if (this.getAvailableDirections().l) {
      var destinationIdx = this.currentIdx() - 1;
      return this.move(destinationIdx);
    } else {
      return this.currentIdx();
    }
  }

  stop(solvable) {
    this.playBackNextMove(0);
  }
}

// STATIC METHODS

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || undefined;
}

// MAZE INSTANTIATION

Math.seedrandom(getURLParameter("seed"));
var height = getURLParameter("height");
var width = getURLParameter("width");
var maze = new Maze(height, width);
