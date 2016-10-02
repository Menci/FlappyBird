'use strict';

function parse(s) {
  return (parseInt(s.substr(0, s.length - 2))) || 0;
}

function change(s, delta, mod) {
  let x = parse(s) + delta;
  if (mod) x %= mod;
  return x + 'px';
}

function rand(l, r) {
  return Math.random() * (r - l + 1) + l;
}

function rectIntersect(a, b) {
  return (a.left <= b.left && a.right >= b.left
      ||  b.left <= a.left && b.right >= a.left)
      && (a.top <= b.top && a.bottom >= b.top
      ||  b.top <= a.top && b.bottom >= a.top);
}

document.addEventListener('DOMContentLoaded', () => {
  const fps = 60;
  const g = 40 / fps;
  let game = false;
  let birdSpeed = 0;
  let scoreVal = 0;
  let gameOverTime = -1;

  let stage = document.getElementById('stage');
  let bird = document.getElementById('bird');
  let pipesTemplate = document.getElementById('pipes-template');
  let bottom = document.getElementById('bottom');
  let score = document.getElementById('score');

  function gameStart() {
    if ((new Date()).getTime() - gameOverTime < 1000) return;

    bird.style.top = '130px';
    bird.style.opacity = 1;
    score.style.opacity = 0;
    let pipes = document.querySelectorAll('.pipes:not(#pipes-template)');
    for (let p of pipes) {
      p.parentNode.removeChild(p);
    }

    birdSpeed = 0;
    scoreVal = 0;

    game = true;
  }

  function gameOver() {
    gameOverTime = (new Date()).getTime();

    game = false;
    score.innerText = scoreVal;
  }

  // bird wings
  setInterval(() => {
    bird.style.backgroundPositionY = change(bird.style.backgroundPositionY, -35, 105);
  }, 100);

  // bird move
  setInterval(() => {
    if (!game) return;
    birdSpeed += g;
    let x = parse(bird.style.top) + birdSpeed * 20 / fps;
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
  setInterval(() => {
    if (!game) return;

    let newPipe = pipesTemplate.cloneNode(true);
    newPipe.removeAttribute('id');
    newPipe.style.left = stage.clientWidth + 'px';

    let top = newPipe.getElementsByClassName('top')[0];
    let bottom = newPipe.getElementsByClassName('bottom')[0];
    let k = rand(-50, 50);
    top.style.height = change(top.style.height, k);
    bottom.style.height = change(bottom.style.height, -k);

    stage.appendChild(newPipe);
  }, 1000);

  // pipes move
  const pipesMoveSpeed = 180;
  let bottom_a = document.getElementById('bottom-a');
  let bottom_b = document.getElementById('bottom-b');
  setInterval(() => {
    if (!game) return;

    let pipes = document.querySelectorAll('.pipes:not(#pipes-template)');
    for (let pipe of pipes) {
      pipe.style.left = change(pipe.style.left, -pipesMoveSpeed / fps);
      if (parse(pipe.style.left) < -69) pipe.parentNode.removeChild(pipe);
    }

    let a = parseInt(bottom_a.style.left.substr(0, bottom_a.style.left.length - 2)) || 0;
    let b = parseInt(bottom_b.style.left.substr(0, bottom_b.style.left.length - 2)) || 0;
    if (a < 0) {
      [a, b] = [b, a];
      [bottom_a, bottom_b] = [bottom_b, bottom_a];
      a = bottom_b.offsetLeft + bottom_b.clientWidth - 4;
    }
    bottom_a.style.left = (a - pipesMoveSpeed / fps) + 'px';
    bottom_b.style.left = (b - pipesMoveSpeed / fps) + 'px';
  }, 1000 / fps);

  function getBirdRect() {
    let _birdRect = bird.getBoundingClientRect(), birdRect = {};
    let stageRect = stage.getBoundingClientRect();
    birdRect.left = _birdRect.left - stageRect.left;
    birdRect.top = _birdRect.top - stageRect.top;
    birdRect.right = birdRect.left + _birdRect.width;
    birdRect.bottom = birdRect.top + _birdRect.height;
    const offset = 10;
    birdRect.left += offset;
    birdRect.top += offset;
    birdRect.right -= offset;
    birdRect.bottom -= offset;
    return birdRect;
  }

  // game over check
  setInterval(() => {
    if (!game) return;

    let birdRect = getBirdRect();
    let stageRect = stage.getBoundingClientRect();

    let rects = new Array();
    let a = stage.querySelectorAll('.pipes .top, .pipes .bottom, #bottom');
    for (let e of a) {
      let _pipeRect = e.getBoundingClientRect(), pipeRect = {};
      pipeRect.left = _pipeRect.left - stageRect.left;
      pipeRect.top = _pipeRect.top - stageRect.top;
      pipeRect.right = pipeRect.left + _pipeRect.width;
      pipeRect.bottom = pipeRect.top + _pipeRect.height;
      rects.push(pipeRect);
    }

    let intersect = false;
    for (let rect of rects) {
      if (rectIntersect(birdRect, rect)) {
        intersect = true;
        break;
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
  setInterval(() => {
    if (!game) return;

    let stageRect = stage.getBoundingClientRect();
    let birdRect = getBirdRect();
    let a = stage.querySelectorAll('.pipes .passtest');
    for (let e of a) {
      if (typeof e.passed !== 'undefined') continue;

      let _rect = e.getBoundingClientRect(), rect = {};
      rect.left = _rect.left - stageRect.left;
      rect.top = _rect.top - stageRect.top;
      rect.right = rect.left + _rect.width;
      rect.bottom = rect.top + _rect.height;

      if (rectIntersect(birdRect, rect)) {
        e.passed = true;
        scoreVal++;
      }
    }
  }, 1000 / fps);

  // bird fade out after game over
  setInterval(() => {
    if (game) return;
    let val = parseFloat(bird.style.opacity);
    if (val === 0) return;

    bird.style.opacity = val -= 0.1;
    score.style.opacity = 1 - val;
  }, 1000 / fps);
});
