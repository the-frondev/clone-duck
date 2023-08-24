if (document.querySelector('.frame').offsetHeight < 600) {
  document.querySelector('.bottom').setAttribute('style', 'display:none');
}

const backgroundSound = new Audio('./assets/music/music.mp3');
backgroundSound.volume = 0.1;
backgroundSound.loop = true;
const chooseSound = new Audio('./assets/music/select_option.mp3');
chooseSound.volume = 0.1;
const bitSound = new Audio('./assets/music/biting.mp3');
bitSound.volume = 0.1;
const gameOverSound = new Audio('./assets/music/game_over.mp3');
gameOverSound.volume = 0.5;

const removeSplashScreen = () => {
  setTimeout(()=> {
    document.querySelector('.home').classList.add('hidden');
    document.querySelector('.difficulty').classList.remove('hidden');
  }, 4000);
}

const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector("#score");
const highScoreElement = document.querySelector("#high-score");

let gameOver = false;
let directionX = 0, directionY = 0;
let duckPositionX = 5, duckPositionY = 5;
let billPositionX = 0, billPositionY = 0;
let duckLine = [];
let score = 0, highScore = localStorage.getItem('highScore') || 0;
let difficulty = 500;
const difficultyElement = document.querySelector('#difficulty');
const difficultyObserver = new MutationObserver(function(mutations) {
  mutations.forEach((mutation) => {
    difficulty = (mutation.type === 'attributes') ? difficultyElement.dataset.delay : difficulty;
  })
});

difficultyObserver.observe(difficultyElement, {
  attributes: true
})

const controls = document.querySelectorAll('.key');

const updateFoodPosition = () => {
  billPositionX = Math.floor(Math.random()*30)+1;
  billPositionY = Math.floor(Math.random()*20)+1;
}

const changeDirection = event => {
  if(document.querySelector('.difficulty').classList.contains('hidden')) {
    if (event.key === "ArrowUp" && directionY != 1) {
      directionX = 0;
      directionY = -1;
    } else if (event.key === "ArrowDown" && directionY !=-1) {
      directionX = 0;
      directionY = 1;
    } else if (event.key === "ArrowRight" && directionX !=-1) {
      directionX = 1;
      directionY = 0;
    }else if (event.key === "ArrowLeft" && directionX != 1) {
      directionX = -1;
      directionY = 0;
    }
  } else {
    let difficultySelected = document.querySelector('.selected');
    switch(event.key) {
      case "ArrowDown":
        chooseSound.pause();
        chooseSound.currentTime = 0;
        chooseSound.play();
        if (difficultySelected.dataset.difficulty != "200") {
          difficultySelected.classList.remove('selected');
          difficultySelected.nextElementSibling.classList.add('selected');
          difficultySelected = difficultySelected.nextElementSibling;
        }
        break;
      case "ArrowUp":
        chooseSound.pause();
        chooseSound.currentTime = 0;
        chooseSound.play();
        if (difficultySelected.dataset.difficulty != "500") {
          difficultySelected.classList.remove('selected');
          difficultySelected.previousElementSibling.classList.add('selected');
          difficultySelected = difficultySelected.previousElementSibling;
        }
        break;
      case "Enter":
        chooseSound.pause();
        chooseSound.currentTime = 0;
        chooseSound.play();
        difficulty = difficultySelected.dataset.difficulty;
        difficultyElement.dataset.delay = difficulty;
        document.querySelector('.difficulty').classList.add('hidden');
        document.querySelector('.game').classList.remove('hidden');
        break;
    }
  }
}

controls.forEach(button => button.addEventListener("click", () => {
  changeDirection({key: button.dataset.key});
}));
controls.forEach(button => button.addEventListener("touch", () => {
  changeDirection({key: button.dataset.key});
}));

const soundOn = () => {
  backgroundSound.play();
}

const soundOff = () => {
  backgroundSound.pause();
  backgroundSound.currentTime = 0;
}

document.querySelector('#sound-on').addEventListener("click", soundOn);
document.querySelector('#sound-off').addEventListener("click", soundOff);

const handleGameOver = () => {
  gameOverSound.play();
  clearTimeout(timeOut);
  document.querySelector('.game').classList.add('hidden');
  document.querySelector('.game-over').classList.remove('hidden');
  setTimeout(() => {
    location.reload();
  }, 4000);
}

const initGame = () => {
  if (gameOver) return handleGameOver();
  highScoreElement.innerHTML = `${highScore}`;

  let html = `<div class="food" style="grid-area: ${billPositionY}/${billPositionX}"></div>`;

  // cuando el pato se come el hongo
  if (duckPositionX === billPositionX && duckPositionY === billPositionY) {
    bitSound.pause();
    bitSound.currentTime = 0;
    bitSound.play();
    updateFoodPosition();
    duckLine.push([billPositionY, billPositionX]);
    score++;
    difficultyElement.dataset.delay = (difficultyElement.dataset.delay > 80) ? difficulty - 12 : difficultyElement.dataset.delay;
    highScore = (score > highScore) ? score : highScore;
    localStorage.setItem("score", score);
    localStorage.setItem("highScore", highScore);
    scoreElement.innerHTML = `${score}`;
    document.querySelector('#go-score').innerHTML = `${score}`;
    highScoreElement.innerHTML = `${highScore}`;
  }

  duckPositionX += directionX;
  duckPositionY += directionY;

  for (let i = duckLine.length - 1; i > 0; i--) {
    duckLine[i] = duckLine[i-1];
  }

  if (duckPositionX <= 0 || duckPositionX > 30 || duckPositionY <= 0 || duckPositionY > 20 ) {
    gameOver = true;
    return handleGameOver();
  }

  duckLine[0] = [duckPositionY, duckPositionX];

  for (let i = 0; i < duckLine.length; i++) {
    html +=`<div class="duck" style="grid-area: ${duckLine[i][0]}/${duckLine[i][1]}; background-image: var(--duck${Math.floor(Math.random()*5)+1}${directionX === 1 ? 'R' : 'L'})"></div>`;
    if (i != 0 && duckLine[0][0] === duckLine[i][0] && duckLine[0][1] === duckLine[i][1]) {
      gameOver = true;
      return handleGameOver();
    }
  }

  playBoard.innerHTML = html;

  timeOut = setTimeout(initGame, difficulty);
}

removeSplashScreen();

updateFoodPosition();

let timeOut = setTimeout(initGame, difficulty);

document.addEventListener("keyup", changeDirection);