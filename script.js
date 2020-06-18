var c = document.getElementById('canvas');
var ctx = c.getContext('2d');
const P2 = Math.PI / 2;
const P3 = 3 * Math.PI / 2;
const DR = 0.0174533 //1 degree in radians
console.log(P2)
function drawBackground() {
  ctx.fillStyle = 'rgba( 100, 100, 100, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const map = {
  xLen: 8,
  yLen: 8,
  tileSize: 64,
  layout:
    [1, 1, 1, 1, 1, 1, 1, 1,
      1, 0, 0, 1, 0, 0, 0, 1,
      1, 0, 0, 0, 0, 0, 0, 1,
      1, 0, 0, 1, 0, 0, 0, 1,
      1, 0, 0, 0, 0, 0, 0, 1,
      1, 0, 0, 0, 0, 0, 0, 1,
      1, 0, 0, 0, 1, 0, 0, 1,
      1, 1, 1, 1, 1, 1, 1, 1]
  ,
  draw: function () {
    for (let y = 0; y < this.yLen; y++) {
      for (let x = 0; x < this.xLen; x++) {
        this.layout[y * this.xLen + x] ? (
          ctx.fillStyle = 'rgba( 0, 0, 0, 1)'

        ) : (
            ctx.fillStyle = 'rgba( 255, 255, 255, 1)'

          )
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize - 1, this.tileSize - 1);
      }
    }
  }
}

function Player(xPos, yPos, deltaX, deltaY, speed, rotation, size) {
  this.size = size;
  this.speed = speed;
  this.xPos = xPos;
  this.deltaX = deltaX;
  this.deltaY = deltaY;
  this.yPos = yPos;
  this.rotation = rotation;
  this.getDist = function (ax, ay, bx, by) {
    return (Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay)));
  }

  this.drawRays3D = function () {
    let r, mx, my, mp, dof, rx, ry, ra, xo, yo, disT;
    ra = this.rotation - DR * 30;
    if (ra < 0) {
      ra += 2 * Math.PI
    }
    if (ra > 2 * Math.PI) {
      ra -= 2 * Math.PI
    }



    for (r = 0; r < 480; r++) {
      //check for horizontal lines
      dof = 0;
      let disH = 1000000, hx = this.xPos, hy = this.Ypos;
      let aTan = -1 / Math.tan(ra);

      if (ra > Math.PI) {
        ry = (((Math.floor(this.yPos) >> 6) << 6) - 0.001);
        rx = (this.yPos - ry) * aTan + this.xPos;
        yo = -64;
        xo = -yo * aTan;

      }
      if (ra < Math.PI) {
        ry = (((Math.floor(this.yPos) >> 6) << 6) + 64);
        rx = (this.yPos - ry) * aTan + this.xPos;
        yo = 64;
        xo = -yo * aTan;

      }
      if (ra == 0 || ra == Math.Pi) {
        rx = this.xPos + this.size / 2;
        ry = this.yPos + this.size / 2;
        dof = 8;
      }
      while (dof < 8) {
        mx = Math.floor(rx >> 6);
        my = Math.floor(ry >> 6);
        mp = my * map.xLen + mx;


        if (mp > 0 && mp < map.xLen * map.yLen && map.layout[mp]) {
          hx = rx;
          hy = ry;
          disH = this.getDist(this.xPos, this.yPos, hx, hy, ra);
          dof = 8;
        }
        else {
          rx += xo; ry += yo; dof += 1;
        }
      }






      //check vertical lines

      dof = 0;
      let disV = 1000000, vx = this.xPos, vy = this.Ypos;
      let nTan = -Math.tan(ra);
      //facing left
      if (ra > P2 && ra < P3) {
        rx = (((Math.floor(this.xPos) >> 6) << 6) - 0.001);
        ry = (this.xPos - rx) * nTan + this.yPos;
        xo = -64;
        yo = -xo * nTan;
      }
      //facing right
      if (ra < P2 || ra > P3) {
        rx = (((Math.floor(this.xPos) >> 6) << 6) + 64);
        ry = (this.xPos - rx) * nTan + this.yPos;
        xo = 64;
        yo = -xo * nTan;

      }
      //facing up or down
      if (ra == 0 || ra == Math.Pi) {
        rx = this.xPos + this.size / 2;
        ry = this.yPos + this.size / 2;
        dof = 8;
      }
      while (dof < 8) {
        mx = Math.floor(rx >> 6);
        my = Math.floor(ry >> 6);
        mp = my * map.xLen + mx;


        if (mp > 0 && mp < map.xLen * map.yLen && map.layout[mp]) {
          vx = rx;
          vy = ry;
          disV = this.getDist(this.xPos, this.yPos, vx, vy, ra);
          dof = 8
        }
        else {
          rx += xo; ry += yo; dof += 1;
        }
      }
      if (disV < disH) { rx = vx; ry = vy; disT = disV; ctx.strokeStyle = "#0000ff"; }
      if (disH < disV) { rx = hx; ry = hy; disT = disH; ctx.strokeStyle = "#1a1aff"; }

      //draw 3D
      //fix fisheye
      let ca = this.rotation - ra; if (ra < 0) { ra += 2 * Math.PI } if (ra > 2 * Math.PI) { ra -= 2 * Math.PI } disT = disT * Math.cos(ca);
      let lineH = map.tileSize * 320 / disT;
      if (lineH > 320) {
        lineH = 320
      }
      let lineO = 160 - lineH / 2;


      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(r * 1 + 540, lineO);
      ctx.lineTo(r * 1 + 540, lineH + lineO);
      ctx.stroke();

      //draw2d

      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.moveTo(this.xPos + this.size / 2, this.yPos + this.size / 2);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      ra += DR / 8;
      if (ra < 0) {
        ra += 2 * Math.PI
      }
      if (ra > 2 * Math.PI) {
        ra -= 2 * Math.PI
      }




    }





  }

  this.draw = function () {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.xPos, this.yPos, this.size, this.size);
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.moveTo(this.xPos + this.size / 2, this.yPos + this.size / 2);
    ctx.lineTo(this.xPos + this.size / 2 + this.deltaX * 20, this.yPos + this.size / 2 + this.deltaY * 20);
    ctx.stroke();
  };
}
const myEventHandler = (e) => {
  switch (e.keyCode) {
    case 83:
      player.xPos -= player.deltaX * player.speed;
      player.yPos -= player.deltaY * player.speed;
      break;
    case 87:
      player.yPos += player.deltaY * player.speed;
      player.xPos += player.deltaX * player.speed;
      break;
    //turn left
    case 65:
      player.rotation -= .1;
      if (player.rotation <= 0) {
        player.rotation = 2 * Math.PI;
      }
      player.deltaX = Math.cos(player.rotation);
      player.deltaY = Math.sin(player.rotation);

      break;
    //turn right
    case 68:
      player.rotation += .1;
      if (player.rotation >= 2 * Math.PI) {
        player.rotation = 0;
      }
      player.deltaX = Math.cos(player.rotation);
      player.deltaY = Math.sin(player.rotation);

      break;

  }

};
const player = new Player(80, 80, 1, 0, 10, 0, 10);
window.addEventListener('keydown', myEventHandler);
const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  map.draw()
  player.draw();
  player.drawRays3D();
  window.requestAnimationFrame(draw);
};
map.draw();
draw();
