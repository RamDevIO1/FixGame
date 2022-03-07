let canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  w = canvas.width = 340;
h = canvas.height = 200;

const tile = 20

const spawnPoints = [{x: 280, y: 37},{ x: 160, y: 40 }, { x: 50, y: 150 }]
const colors = ["red", "blue", "green", "yellow"]
let imgHero, imgGun, imgPackage, imgBullet, imgTiles;

let playerUid
let players = {}
let playerRef



let playersData = []
let bullets = []
let stats = []
let packages = []
let time = 0
let loggedIn = false;
const playerMaxFrame = 5;

// consts

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 3, 3, 1, 3, 3, 0, 0, 0, 0, 0, 1],
  [1, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]
];

function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
  ]);
  return `${prefix} ${animal}`;
}
const playerColors = ["blue", "red", "yellow", "green"];

//Misc Helpers
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}


function loginPlayer() {
  let spawningPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

  firebase.auth().onAuthStateChanged((user) => {
    console.log(user)
    if (user) {
      //You're logged in!
      playerUid = user.uid;
      playerRef = firebase.database().ref(`Server-1/players/${playerUid}`);

      playerRef.set({
        uid: playerUid,
        name: createName(),
        color: randomFromArray(playerColors),
        x: spawningPoint.x,
        y: spawningPoint.y,
        vx: 0,
        vy: 0,
        ground: false,
        sprite: {
          frame: 0,
          tillNext: 0,
          turned: 'right'
        }
      })

      //Remove me from Firebase when I diconnect
      playerRef.onDisconnect().remove();

      initGame()
    } else {
      //You're logged out.
    }
  })

  firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    console.log(errorCode, errorMessage);
  });
}

function initGame() {


  const allPlayersRef = firebase.database().ref(`Server-1/players`);

  allPlayersRef.on("value", (snapshot) => {
    //Fires whenever a change occurs
    players = snapshot.val() || {};
    Object.keys(players).forEach((key) => {
      const characterState = players[key];
      let a = `${characterState.uid} - ${characterState.name}`
      console.log()
    })
  })
  allPlayersRef.on("child_added", (snapshot) => {
    //Fires whenever a new node is added the tree
    const addedPlayer = snapshot.val();
    let b = `${addedPlayer.uid} - ${addedPlayer.name}`
    console.log()
  })

  //Remove character DOM element after they leave
  allPlayersRef.on("child_removed", (snapshot) => {
    const removedKey = snapshot.val().id;
  })
}

function rectToTile(rect, maps = map) {
  let left_up = maps[Math.floor(rect.y / tile)][Math.floor(rect.x / tile)],
    right_up = maps[Math.floor(rect.y / tile)][Math.ceil(rect.x / tile)],
    left_down = maps[Math.ceil(rect.y / tile)][Math.floor(rect.x / tile)],
    right_down = maps[Math.ceil(rect.y / tile)][Math.ceil(rect.x / tile)];
       /*if (((left_up === 3 && right_up === 3) || (left_up === 3 && right_up === 0) || (left_up === 0 && right_up === 3) || (left_up === 0 && right_up === 0)) && 
           ((left_down === 3 && right_down === 3) || (left_down === 3 && right_down === 0) || (left_down === 0 && right_down === 3) && 
           ((left_down === 0 && right_down === 0) || (left_up === 0 && right_up === 0))))
           return false;*/
  if (left_up === 1 || right_up === 1 || left_down === 1 || right_down === 1 ||
    left_up === 2 || right_up === 2 || left_down === 2 || right_down === 2 ||
    left_up === 3 || right_up === 3 || left_down === 3 || right_down === 3)
    return true;
  else {
    return false;
  }
}

function pointToTile(point, maps = map) {
  if (maps[Math.floor(point.y / tile)][Math.floor(point.x / tile)] !== 0)
    return true;
  else
    return false;
}

function rectToPoint(rect, point) {
  if (point.x < rect.x || point.x > rect.x + tile ||
    point.y < rect.y || point.y > rect.y + tile)
    return false;
  else
    return true;
}

function rectToRect(rect1, rect2) {
  if (rect1.x + tile < rect2.x || rect2.x + tile < rect1.x ||
    rect1.y + tile < rect2.y || rect2.y + tile < rect1.y)
    return false;
  else
    return true;
}

var myFont = new FontFace('primaryFont', 'url(font/Bungee.ttf)');
myFont.load().then(function(font) {
  document.fonts.add(font);
  console.log('Font loaded');
});

function draw() {
  ctx.clearRect(0, 0, w, h);
  // ctx.fillStyle = "#757575";
  ctx.fillStyle = "#80C9C1";
  //ctx.fillStyle = "#3BD7FF";
  ctx.fillRect(0, 0, w, h);

  // drawing map
  ctx.fillStyle = "#353535";
  if (map !== undefined) {
    for (let i = 0; i < map[0].length; i++) {
      for (let j = 0; j < map.length; j++) {
        if (map[j][i] !== 0) {
          ctx.drawImage(imgTiles, (map[j][i] - 1) * tile, 0, tile, tile, i * tile, j * tile, tile, tile);
        }
      }
    }
  }

  Object.keys(players).forEach((key) => {
    // function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height)
    // imageX ~ frame
    const playerd = players[key];

    if (playerd.sprite.frame === -1) {
      drawFlippedImage(ctx, imgHero, playerd.sprite.turned, playerd.x, playerd.y, 2 * tile, colors.indexOf(playerd.color) * tile, tile, tile);
    }
    else if (playerd.sprite.frame === 0) {
      drawFlippedImage(ctx, imgHero, playerd.sprite.turned, playerd.x, playerd.y, 0, colors.indexOf(playerd.color) * tile, tile, tile);
    }
    else {
      drawFlippedImage(ctx, imgHero, playerd.sprite.turned, playerd.x, playerd.y, playerd.sprite.frame * tile, colors.indexOf(playerd.color) * tile, tile, tile);
    }

  });


  //info bar
  ctx.font = "14px primaryFont";
  ctx.fillStyle = "#fff";
  ctx.fillText(`HP: 0`, 5, 15);
  ctx.fillText(`ammo: unlimited`, 5, 30);

  // functions
  function compareKD(a, b) {
    if (a.k <= b.k)
      return 1;
    else
      return -1;
  }

  function fade() {
    ctx.fillStyle = "rgba(53,53,53,0.6)";
    ctx.fillRect(0, 0, w, h);
  }

  function drawRotatedImage(context, image, angle, x, y, imageX, imageY, width, height) {
    context.translate(x, y);
    context.rotate(angle);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2)
      context.scale(1, -1);
    context.drawImage(image, imageX, imageY, width, height, 0, 0, width, height);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2)
      context.scale(1, -1);
    context.rotate(-angle);
    context.translate(-x, -y);
  }

  function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height) {
    context.translate(x, y);
    if (turned === "left")
      context.scale(-1, 1);
    context.drawImage(image, imageX, imageY, width, height, turned === "left" ? -20 : 0, 0, width, height);
    if (turned === "left")
      context.scale(-1, 1);
    context.translate(-x, -y);
  }
}

const test = {
  w: true,
  a: true,
  d: true
}

function updatePlayer() {
  const player = players[playerUid];

  // let player = players.filter(p => p.id === player.id)[0];
/*
  if (player.down === undefined)
    player.down = [];*/

  if (player !== undefined) {

    if (player.respawnAt === time) {
      let spawningPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      player.x = spawningPoint.x;
      player.y = spawningPoint.y;
      delete player.respawnAt;
    }

    if (controller.buttons[0].active) {
      player.sprite.turned = 'left'
      if (player.vx > -5)
        player.vx -= 0.5;
    }
    else if (controller.buttons[1].active) {
      player.sprite.turned = 'right'
      if (player.vx < 5)
        player.vx += 0.5;
    }
    else {
      if (player.vx > 0)
        player.vx -= 0.5;
      else if (player.vx < 0)
        player.vx += 0.5;
    }

    if (controller.buttons[3].active && player.ground) {
      player.vy = -9.5;
      player.ground = false;
    }

    player.ground = false;
    if (rectToTile({ x: player.x, y: player.y + 1}, map))
      player.ground = true;
    if (!player.ground) {
      player.vy += 0.8;
    }

    if (!rectToTile({ x: player.x + player.vx, y: player.y }, map))
      player.x += player.vx;
    else {
      do {
        if (player.vx > 0)
          player.vx -= 0.5;
        else if (player.vx < 0)
          player.vx += 0.5;
      } while (rectToTile({ x: player.x + player.vx, y: player.y }, map));
      player.x += player.vx;
    }

    if (!rectToTile({ x: player.x, y: player.y + player.vy }, map))
      player.y += player.vy;
    else {
      do {
        if (player.vy > 0)
          player.vy -= 0.5;
        else if (player.vy < 0)
          player.vy += 0.5;
      } while (rectToTile({ x: player.x, y: player.y + player.vy }, map));
      player.y += player.vy;
      if (player.vy > 0)
        player.ground = true;
      player.vy = 0;
    }


    // managing sprites
    if (player.vx === 0 && player.vy === 0) {
      // staying
      player.sprite.frame = 0;
      player.sprite.tillNext = -1;
    }
    else if (player.vy !== 0) {
      // jumping
      player.sprite.frame = -1
      player.sprite.tillNext = -1
    }
    else if (player.vx !== 0 && player.vy === 0) {
      // moving
      if (player.sprite.frame < 1) {
        player.sprite.frame = 1;
        player.sprite.tillNext = 5;
      }

      player.sprite.tillNext--;
      if (player.sprite.tillNext <= 0) {
        player.sprite.tillNext = 5;
        player.sprite.frame++;
        if (player.sprite.frame === playerMaxFrame)
          player.sprite.frame = 1;
      }
    }

    players[playerUid].x = player.x
    players[playerUid].y = player.y
    players[playerUid].ground = player.ground
    players[playerUid].sprite = player.sprite
    playerRef.set(players[playerUid])
    /*
          players.forEach(p => {
            if (p.id === player.id) {
              p.x = player.x;
              p.y = player.y;
              p.dx = player.dx;
              p.dy = player.dy;
              p.ground = player.ground;
              p.mouse = player.mouse;
              p.sprite = player.sprite;
            }
          });*/


  }

}

setInterval(() => {
  updatePlayer();

  /*
      let data = {
          players: players.filter(player => player.respawnAt === undefined),
          bullets: bullets,
          packages: packages,
          stats: stats
      }*/

}, 30);


function loadImages() {
  imgHero = new Image();
  imgHero.src = "./img/player.png";
  imgGun = new Image();
  imgGun.src = "./img/weapon.png";
  imgPackage = new Image();
  imgPackage.src = "./img/package.png"
  imgBullet = new Image();
  imgBullet.src = "./img/bullets.png"
  imgTiles = new Image();
  imgTiles.src = "./img/tiles.png";
}

setInterval(() => {
  time++;
}, 1000);

function update() {
  draw();
  renderButtons(controller.buttons);

  requestAnimationFrame(update);
}
loadImages();
update();
