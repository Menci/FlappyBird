'use strict';

function parse(s) {
  return parseInt(s.substr(0, s.length - 2)) || 0;
}

function change(s, delta, mod) {
  var x = parse(s) + delta;
  if (mod) x %= mod;
  return x + 'px';
}

function rand(l, r) {
  return Math.random() * (r - l + 1) + l;
}

function rectIntersect(a, b) {
  return (a.left <= b.left && a.right >= b.left || b.left <= a.left && b.right >= a.left) && (a.top <= b.top && a.bottom >= b.top || b.top <= a.top && b.bottom >= a.top);
}

document.addEventListener('DOMContentLoaded', function () {
  var fps = 60;
  var g = 40 / fps;
  var game = false;
  var birdSpeed = 0;
  var scoreVal = 0;
  var gameOverTime = -1;

  var stage = document.getElementById('stage');
  var bird = document.getElementById('bird');
  var pipesTemplate = document.getElementById('pipes-template');
  var bottom = document.getElementById('bottom');
  var score = document.getElementById('score');

  function gameStart() {
    if (new Date().getTime() - gameOverTime < 1000) return;

    bird.style.top = '130px';
    bird.style.opacity = 1;
    score.style.opacity = 0;
    var pipes = document.querySelectorAll('.pipes:not(#pipes-template)') || [];
    if (!pipes.length) pipes = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = pipes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var p = _step.value;

        p.parentNode.removeChild(p);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    birdSpeed = 0;
    scoreVal = 0;

    game = true;
  }

  function gameOver() {
    gameOverTime = new Date().getTime();

    game = false;
    score.innerText = scoreVal;
  }

  // bird wings
  setInterval(function () {
    bird.style.backgroundPositionY = change(bird.style.backgroundPositionY, -35, 105);
  }, 100);

  // bird move
  setInterval(function () {
    if (!game) return;
    birdSpeed += g;
    var x = parse(bird.style.top) + birdSpeed * 20 / fps;
    if (x < 0) x = 0;
    if (x === 0) birdSpeed = 0;
    bird.style.top = x + 'px';
  }, 1000 / fps);

  // bird click to fly up
  function onclick() {
    if (!game) return gameStart();

    if (birdSpeed > 0) birdSpeed = 0;
    birdSpeed = -g / 3 * fps;
    // birdSpeed -= g * 2;
  }
  stage.addEventListener('click', onclick);
  stage.addEventListener('tap', onclick);

  // generate pipes
  setInterval(function () {
    if (!game) return;

    var newPipe = pipesTemplate.cloneNode(true);
    newPipe.removeAttribute('id');
    newPipe.style.left = stage.clientWidth + 'px';

    var top = newPipe.getElementsByClassName('top')[0];
    var bottom = newPipe.getElementsByClassName('bottom')[0];
    var k = rand(-50, 50);
    top.style.height = change(top.style.height, k);
    bottom.style.height = change(bottom.style.height, -k);

    stage.appendChild(newPipe);
  }, 1000);

  // pipes move
  var pipesMoveSpeed = 180;
  var bottom_a = document.getElementById('bottom-a');
  var bottom_b = document.getElementById('bottom-b');
  setInterval(function () {
    if (!game) return;

    var pipes = document.querySelectorAll('.pipes:not(#pipes-template)') || [];
    if (!pipes.length) pipes = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = pipes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var pipe = _step2.value;

        pipe.style.left = change(pipe.style.left, -pipesMoveSpeed / fps);
        if (parse(pipe.style.left) < -69) pipe.parentNode.removeChild(pipe);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var a = parseInt(bottom_a.style.left.substr(0, bottom_a.style.left.length - 2)) || 0;
    var b = parseInt(bottom_b.style.left.substr(0, bottom_b.style.left.length - 2)) || 0;
    if (a < 0) {
      var _ref = [b, a];
      a = _ref[0];
      b = _ref[1];
      var _ref2 = [bottom_b, bottom_a];
      bottom_a = _ref2[0];
      bottom_b = _ref2[1];

      a = bottom_b.offsetLeft + bottom_b.clientWidth - 4;
    }
    bottom_a.style.left = a - pipesMoveSpeed / fps + 'px';
    bottom_b.style.left = b - pipesMoveSpeed / fps + 'px';
  }, 1000 / fps);

  function getBirdRect() {
    var _birdRect = bird.getBoundingClientRect(),
        birdRect = {};
    var stageRect = stage.getBoundingClientRect();
    birdRect.left = _birdRect.left - stageRect.left;
    birdRect.top = _birdRect.top - stageRect.top;
    birdRect.right = birdRect.left + _birdRect.width;
    birdRect.bottom = birdRect.top + _birdRect.height;
    var offset = 10;
    birdRect.left += offset;
    birdRect.top += offset;
    birdRect.right -= offset;
    birdRect.bottom -= offset;
    return birdRect;
  }

  // game over check
  setInterval(function () {
    if (!game) return;

    var birdRect = getBirdRect();
    var stageRect = stage.getBoundingClientRect();

    var rects = new Array();
    var a = stage.querySelectorAll('.pipes .top, .pipes .bottom, #bottom');
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = a[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var e = _step3.value;

        var _pipeRect = e.getBoundingClientRect(),
            pipeRect = {};
        pipeRect.left = _pipeRect.left - stageRect.left;
        pipeRect.top = _pipeRect.top - stageRect.top;
        pipeRect.right = pipeRect.left + _pipeRect.width;
        pipeRect.bottom = pipeRect.top + _pipeRect.height;
        rects.push(pipeRect);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var intersect = false;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = rects[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var rect = _step4.value;

        if (rectIntersect(birdRect, rect)) {
          intersect = true;
          break;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    if (intersect) {
      gameOver();
      // console.log('boom');
      // bird.style.opacity = 0.3;
    } else {
        // bird.style.opacity = 1;
      }
  }, 1000 / fps);

  // score counter
  setInterval(function () {
    if (!game) return;

    var stageRect = stage.getBoundingClientRect();
    var birdRect = getBirdRect();
    var a = stage.querySelectorAll('.pipes .passtest') || [];
    if (!a.length) a = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = a[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var e = _step5.value;

        if (typeof e.passed !== 'undefined') continue;

        var _rect = e.getBoundingClientRect(),
            rect = {};
        rect.left = _rect.left - stageRect.left;
        rect.top = _rect.top - stageRect.top;
        rect.right = rect.left + _rect.width;
        rect.bottom = rect.top + _rect.height;

        if (rectIntersect(birdRect, rect)) {
          e.passed = true;
          scoreVal++;
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  }, 1000 / fps);

  // bird fade out after game over
  setInterval(function () {
    if (game) return;
    var val = parseFloat(bird.style.opacity);
    if (val === 0) return;

    bird.style.opacity = val -= 0.1;
    score.style.opacity = 1 - val;
  }, 1000 / fps);
});

