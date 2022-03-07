
/*
class player {
  constructor(name, color, x, y) {
    this.name = name;
    this.color = color;
    this.hp = 100;
    this.ammo = -1;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy =0;
    this.ground = false;
    this.tillNextBullet = 0;
    this.sprite = {
      frame: 0,
      tillNext: 0
    }
  }
  draw() {
    if (this.sprite.frame === -1) {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 2 * t, colors.indexOf(player.color) * t, t, t);
    }
    else if (this.sprite.frame === 0) {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 0, colors.indexOf(player.color) * t, t, t);
    }
    else {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, player.sprite.frame * t, colors.indexOf(player.color) * t, t, t);
    }
    
    hp = this.hp;
    ammo = this.ammo;
  }
}
*/
let Input = {
  pressed: {},
  keys: { w: 87, s: 83, a: 65, d: 68, t: 84 },
  mouse: { x: 0, y: 0, pressed: false },
  isDown: function(keyCode) { return this.pressed[this.keys[keyCode]]; },
  onKeyDown: function(event) { this.pressed[event.keyCode] = true; },
  onKeyUp: function(event) { delete this.pressed[event.keyCode]; }
};
window.addEventListener('keyup', (event) => { Input.onKeyUp(event); }, false);
window.addEventListener('keydown', (event) => { Input.onKeyDown(event); }, false);
window.addEventListener('mousemove', (event) => { getMouseCords(event); }, false);
window.addEventListener('mousedown', (event) => { Input.mouse.pressed = true; });
window.addEventListener('mouseup', (event) => { Input.mouse.pressed = false; });

function getMouseCords(event) {
  let rect = canvas.getBoundingClientRect();
  Input.mouse.x = event.clientX - rect.left;
  Input.mouse.y = event.clientY - rect.top;
}


const pid = document.getElementById('id').value
let socket = {
  id: pid
}
const colors = ["red", "blue", "green", "yellow"]

// consts
const 
packageType = ["gun1", "gun2", "health"],
  gunType = ["default", "gun1", "gun2"],
  bulletType = {
    "default": "#fff",
    "gun1": "#832",
    "gun2": "#3f4"
  };

const spawnPoints = [{ x: 40, y: 120 }, { x: 100, y: 120 }],
  bulletSpeed = {
    "default": 15,
    "gun1": 20,
    "gun2": 12
  },
  bulletDelay = {
    "default": 8,
    "gun1": 15,
    "gun2": 12
  },
  bulletAmmo = {
    "default": -1,
    "gun1": 8,
    "gun2": 10,
  },
  bulletDamage = {
    "default": 20,
    "gun1": 60,
    "gun2": 40
  },
  packageSpawnPoints = [{ x: 40, y: 180 }, { x: 340, y: 180 }, { x: 40, y: 240 }, { x: 340, y: 240 }],
  packageHealth = 20,
  packageSpawnTime = 10,
  playerMaxFrame = 5;

// data
let players = [],
  serverData,
  bullets = [],
  stats = [],
  packages = [],
  time = 0,
  loggedIn = false,
  playersData = [];




setInterval(() => {
  let statsChanged = false;

  players.forEach(player => {
    let pd = playersData.filter(pd => pd.id === player.id)[0];
    updatePlayer(pd);
    packages.forEach(package => {
      if (rectToRect({ x: player.x, y: player.y }, { x: package.x, y: package.y })) {
        if (package.type === "health")
          player.hp += packageHealth;
        else {
          player.gun = package.type;
          player.ammo = bulletAmmo[package.type];
        }
        packages.splice(packages.indexOf(package), 1);
      }
    });
  });

  bullets.forEach(bullet => {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    players.forEach(player => {
      //TODO: change - rectToCircle
      if (player.id !== bullet.id && rectToPoint({ x: player.x, y: player.y }, { x: bullet.x, y: bullet.y })) {
        // TODO: collision type depend on bullet
        player.hp -= bulletDamage[bullet.type];
        bullets.splice(bullets.indexOf(bullet), 1);
      }
      if (player.hp <= 0 && player.respawnAt === undefined) {
        player.respawnAt = time + 5;
        player.x = -20;
        player.y = -20;
        stats.forEach(stat => {
          if (stat.id === player.id) {
            stat.d++;
          }
          else if (stat.id === bullet.id) {
            stat.k++;
          }
        });
        statsChanged = true;
      }
    });
    if (pointToTile({ x: bullet.x, y: bullet.y }, map))
      bullets.splice(bullets.indexOf(bullet), 1);
  });

  let data = {
    players: players.filter(player => player.respawnAt === undefined),
    bullets: bullets,
    packages: packages,
    stats: stats
  }



  if (data.players !== undefined)
    players = data.players;
  if (data.bullets !== undefined)
    bullets = data.bullets;
  if (data.stats !== undefined)
    stats = data.stats;
  if (data.packages !== undefined)
    packages = data.packages;
}, 30);




setInterval(() => {
  time++;
  if (time % packageSpawnTime === 0 && packages.length < packageSpawnPoints.length)
    spawnPackage();
}, 1000);

let up = false,
  leftbtn = false,
  rightbtn = false,
  statsbtn = false,
  shootbtn = false

function getInput() {
  let playerData = {
    id: socket.id,
    down: [],
    mouse: {
      x: Input.mouse.x,
      y: Input.mouse.y,
      pressed: Input.mouse.pressed
    }
  };


  /*
      if (Input.isDown('w'))
          playerData.down.push('w');
      else */
  if (shootbtn)
    playerData.down.push('s');
  /*
      if (Input.isDown('a'))
          playerData.down.push('a');
      else if (Input.isDown('d'))
          playerData.down.push('d');*/

  if (controller.buttons[2].active)
    playerData.down.push('w');
  if (controller.buttons[0].active)
    playerData.down.push('a');
  if (controller.buttons[1].active)
    playerData.down.push('d');
  /*
      else if (Input.isDown('d'))
        playerData.down.push('d');*/


  playersData.forEach(pd => {
    if (pd.id === playerData.id) {
      pd.down = playerData.down;
      pd.mouse = playerData.mouse;
    }
  });

}



function draw() {
  // drawing objects
  let hp, ammo;


  players.forEach(player => {
    // function drawFlippedImage(context, image, turned, x, y, imageX, imageY, width, height)
    // imageX ~ frame

    if (player.sprite.frame === -1) {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 2 * t, colors.indexOf(player.color) * t, t, t);
    }
    else if (player.sprite.frame === 0) {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, 0, colors.indexOf(player.color) * t, t, t);
    }
    else {
      drawFlippedImage(ctx, imgHero, player.sprite.turned, player.x, player.y, player.sprite.frame * t, colors.indexOf(player.color) * t, t, t);
    }

    if (player.id == socket.id) {
      hp = player.hp;
      ammo = player.ammo;
    }

    // draw gun
    if (player.mouse !== undefined) {
      let dy = player.mouse.y - player.y - 10,
        dx = player.mouse.x - player.x - 10,
        angle = Math.atan2(dy, dx);
        //angle = Math.atan2(joystickangle2, joystickangle)
      drawRotatedImage(ctx, imgGun, angle % (Math.PI * 2), player.x + 10, player.y + 5, gunType.indexOf(player.gun) * t, 0, t, 15);
    }
  });

  let isFaded = false;

  if (statsbtn) {
    fade();
    isFaded = true;

    ctx.fillStyle = "#fff";
    let y = 0;
    ctx.fillText(`kills       deaths`, 200, 30);
    let statsToCompare = stats.map(k => k).sort(compareKD);

    statsToCompare.forEach(stat => {
      if (stat.id == socket.id) {
        ctx.fillStyle = "rgba(155,155,155,0.6)";
        ctx.fillRect(45, 35 + y, 250, 22);
        ctx.fillStyle = "#fff";
      }
      ctx.fillText(`${stat.name}`, 50, 50 + y);
      ctx.fillText(`${stat.k}`, 200, 50 + y);
      ctx.fillText(`${stat.d}`, 250, 50 + y);
      y += 20;
    });
  }

  let playersIDs = players.map(player => player.id);
  if (playersIDs.indexOf(socket.id) === -1 && !isFaded) {
    fade();

    ctx.fillStyle = "#fff";
    if (loggedIn) {
      ctx.fillText('You died!', w / 2 - 40, h / 2);
      ctx.fillText(`respawning in 5 seconds`, w / 2 - 80, h / 2 + 20);
    }
    else {
      ctx.fillText("please customize and hit play button!", w / 2 - 120, h / 2);
    }
  }

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

function loginPlayer() {
  let name = document.getElementById("playerName").value,
    color = document.getElementById("color").value;
  let player = { name: name, color: color };

  let names = players.map(player => player.name);
  if (names.indexOf(name) !== -1)
    return;

  loggedIn = true;
  createPlayer(player, socket.id)

  document.getElementById('login').style = "display:none";
}

function createPlayer(playerData, socketId) {
  let spawningPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  players.push({
    id: socketId,
    name: playerData.name,
    color: playerData.color,
    hp: 100,
    gun: "default",
    ammo: -1,
    x: spawningPoint.x,
    y: spawningPoint.y,
    vx: 0,
    vy: 0,
    ground: false,
    tillNextBullet: 0,
    sprite: {
      frame: 0,
      tillNext: 0,
    }
    //respawnAt
  });
  playersData.push({
    id: socketId,
    down: [],
    mouse: undefined
  });
  stats.push({
    id: socketId,
    name: playerData.name,
    k: 0,
    d: 0
  });
}

function rectToTile(rect, tile = map) {
  let left_up = tile[Math.floor(rect.y / t)][Math.floor(rect.x / t)],
    right_up = tile[Math.floor(rect.y / t)][Math.ceil(rect.x / t)],
    left_down = tile[Math.ceil(rect.y / t)][Math.floor(rect.x / t)],
    right_down = tile[Math.ceil(rect.y / t)][Math.ceil(rect.x / t)];

  // if (((left_up === 3 && right_up === 3) || (left_up === 3 && right_up === 0) || (left_up === 0 && right_up === 3) || (left_up === 0 && right_up === 0)) && 
  //     ((left_down === 3 && right_down === 3) || (left_down === 3 && right_down === 0) || (left_down === 0 && right_down === 3) && 
  //     ((left_down === 0 && right_down === 0) || (left_up === 0 && right_up === 0))))
  //     return false;
  if (left_up === 1 || right_up === 1 || left_down === 1 || right_down === 1 ||
    left_up === 2 || right_up === 2 || left_down === 2 || right_down === 2 ||
    left_up === 3 || right_up === 3 || left_down === 3 || right_down === 3)
    return true;
  else {
    return false;
  }
}

function pointToTile(point, tile = map) {
  if (tile[Math.floor(point.y / t)][Math.floor(point.x / t)] !== 0)
    return true;
  else
    return false;
}

function rectToPoint(rect, point) {
  if (point.x < rect.x || point.x > rect.x + t ||
    point.y < rect.y || point.y > rect.y + t)
    return false;
  else
    return true;
}

function rectToRect(rect1, rect2) {
  if (rect1.x + t < rect2.x || rect2.x + t < rect1.x ||
    rect1.y + t < rect2.y || rect2.y + t < rect1.y)
    return false;
  else
    return true;
}
function spawnPackage() {
    let alreadySpawned = packages.map(point => {
            return String(point.x)+','+String(point.y);
        }),
        availablePoints = packageSpawnPoints.map(point => {
            return String(point.x)+','+String(point.y);
        }).filter(point => {
            return (alreadySpawned.indexOf(point) === -1)
        }).map(point => {
            let cords = point.split(',');
            return {x: Number(cords[0]), y: Number(cords[1])};
        }),
        spawnPoint = availablePoints[Math.floor(Math.random()*availablePoints.length)];

    packages.push({type: packageType[Math.floor(Math.random()*packageType.length)], x: spawnPoint.x, y: spawnPoint.y});
}

function updatePlayer(playerData = { id: player.id, down: [] }) {
  let player = players.filter(p => p.id === playerData.id)[0];

  if (playerData.down === undefined)
    playerData.down = [];

  if (playerData.mouse === undefined)
    playerData.mouse = { x: undefined, Y: undefined };

  if (player !== undefined) {

    if (player.respawnAt === time) {
      let spawningPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      player.hp = 100,
        player.gun = "default";
      player.ammo = -1;
      player.x = spawningPoint.x;
      player.y = spawningPoint.y;
      delete player.respawnAt;
    }

    if (player.hp > 0) {
      if (playerData.down.indexOf('a') !== -1) {
        if (player.vx > -5)
          player.vx -= 0.5;
                player.sprite.turned = "left";

      }
      else if (playerData.down.indexOf('d') !== -1) {
        if (player.vx < 5)
          player.vx += 0.5;
                player.sprite.turned = "right";

      }
      else {
        if (player.vx > 0)
          player.vx -= 0.5;
        else if (player.vx < 0)
          player.vx += 0.5;
      }

      if (playerData.down.indexOf('w') !== -1 && player.ground) {
        player.vy = -9.5;
        player.ground = false;
      }

      player.ground = false;
      if (rectToTile({ x: player.x, y: player.y + 1 }, map))
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
      // shooting bullets
      if (shootbtn && playerData.mouse !== undefined && player.respawnAt === undefined) {
        if (shootbtn && player.tillNextBullet <= 0) {
          player.tillNextBullet = bulletDelay[player.gun];
          let angle = Math.atan2(playerData.mouse.y - player.y - 5, playerData.mouse.x - player.x - 9);
          if (player.ammo > 0)
            player.ammo--;
          if (player.ammo === 0) {
            player.gun = 'default';
            player.ammo = -1;
          }

          bullets.push({
            id: player.id,
            type: player.gun,
            x: player.x + 10,
            y: player.y + 12,
            vx: Math.cos(angle) * bulletSpeed[player.gun],
            vy: Math.sin(angle) * bulletSpeed[player.gun]
          });
        }
        player.tillNextBullet--;
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

      if (playerData.mouse.x !== undefined);

      players.forEach(p => {
        if (p.id === player.id) {
          p.x = player.x;
          p.y = player.y;
          p.dx = player.dx;
          p.dy = player.dy;
          p.ground = player.ground;
          p.mouse = playerData.mouse;
          p.sprite = player.sprite;
        }
      });
    }
  }
}





function loadImages() {
  imgHero = new Image();
  imgHero.src = "../assets/img/player.png";
  imgGun = new Image();
  imgGun.src = "../assets/img/weapon.png";
  imgPackage = new Image();
  imgPackage.src = "../assets/img/package.png"
  imgBullet = new Image();
  imgBullet.src = "../assets/img/bullets.png"
  imgTiles = new Image();
  imgTiles.src = "../assets/img/tiles.png";
}


