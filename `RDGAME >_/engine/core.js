const canvas = document.getElementById('display')
const ctx = canvas.getContext('2d')
const w = canvas.width = 340;
const h = canvas.height = 200;

const t = 20
let imgHero, imgGun, imgPackage, imgBullet, imgTiles;

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]
];

var myFont = new FontFace('primaryFont', 'url(assets/font/Bungee.ttf)');
myFont.load().then(function(font) {
  // with canvas, if this is ommited won't work 
  document.fonts.add(font);
  console.log('Font loaded');
});

function draw() {
  ctx.clearRect(0, 0, w, h);
  //ctx.fillStyle = "#757575";
  ctx.fillStyle = "#19C0FF";
  //ctx.fillStyle = "#222034";
  ctx.fillRect(0, 0, w, h);

  // drawing map
  ctx.fillStyle = "#353535";
  if (map !== undefined) {
    for (let i = 0; i < map[0].length; i++) {
      for (let j = 0; j < map.length; j++) {
        if (map[j][i] !== 0) {
          ctx.drawImage(imgTiles, (map[j][i] - 1) * t, 0, t, t, i * t, j * t, t, t);
        }
      }
    }
  }

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
  /*
    // draw gun
    if (player.mouse !== undefined) {
      let dy = player.mouse.y - player.y - 20,
        dx = player.mouse.x - player.x - 20,
        angle = Math.atan2(dy, dx);
        //angle = Math.atan2(joystickangle2, joystickangle)
      drawRotatedImage(ctx, imgGun, angle % (Math.PI * 2), player.x + 10, player.y + 5, gunType.indexOf(player.gun) * t, 0, t, 15);
    }*/
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
      ctx.fillText("please customize and hit play button!", w / 2 - 161, h / 2);
    }
  }
  

  //info bar
  ctx.font = "14px primaryFont";
  ctx.fillStyle = "#fff";
  //ctx.fillText(`${time}`, 5, 15);
  ctx.fillText(`HP: ${hp}`, 5, 15);
  ctx.fillText(`${ammo===-1?"unlimited":ammo} :ammo`, 194, 15);

  renderButtons(controller.buttons);


  message.innerHTML = "touches: " + "_" + "<br>- ";

  if (controller.buttons[0].active) {
    message.innerHTML += "jump ";
  }

  if (controller.buttons[1].active) {
    message.innerHTML += "left ";
  }

  if (controller.buttons[2].active) {
    message.innerHTML += "right ";
  }
  message.innerHTML += "-";


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


function update() {
  draw();
if (loggedIn)
  getInput();
  requestAnimationFrame(update);
}
loadImages()
update();
