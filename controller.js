let controller;
let btn_panel = document.getElementById("controller").getContext("2d")
btn_panel.canvas.height = 90;
btn_panel.canvas.width = 334;




// basically a rectangle, but it's purpose here is to be a button:
Button = function(x, y, width, height, color) {
  this.active = false;
  this.color = color;
  this.height = height;
  this.width = width;
  this.x = x;
  this.y = y;
}

Button.prototype = {
  pointer: function(x, y) {
    if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.width) {
      return false;
    }
    return true;
  }
};

controller = {
  buttons: [
    new Button(15, 20, 50, 50, "#D8E2EB"),
    new Button(85, 20, 50, 50, "#D8E2EB"),
    new Button(190, 20, 50, 50, "#D8E2EB"),
    new Button(260  , 20, 50, 50, "#D8E2EB")
  ],

  eventButtons: function(target_touches) {
    let button, index0, index1, touch;

    for (index0 = this.buttons.length - 1; index0 > -1; --index0) {
      button = this.buttons[index0];
      button.active = false;
      for (index1 = target_touches.length - 1; index1 > -1; --index1) {
        touch = target_touches[index1];
        if (button.pointer((touch.clientX - btn_panel.canvas.getBoundingClientRect().left) * btn_panel.canvas.width / btn_panel.canvas.width, (touch.clientY - btn_panel.canvas.getBoundingClientRect().top) * btn_panel.canvas.width / btn_panel.canvas.width)) {
          button.active = true;
          break;
        }
      }
    }
    
    
  },

  touchEnd: function(event) {
    event.preventDefault();
    controller.eventButtons(event.targetTouches);
  },
  touchMove: function(event) {
    event.preventDefault();
    controller.eventButtons(event.targetTouches);
  },
  touchStart: function(event) {
    event.preventDefault();
    controller.eventButtons(event.targetTouches);
  }
};

function renderButtons(buttons) {
  let button, index;
  btn_panel.fillStyle = "#202830";
  btn_panel.fillRect(0, 150, btn_panel.canvas.width, btn_panel.canvas.height);
  for (index = buttons.length - 1; index > -1; --index) {
    button = buttons[index];
    btn_panel.fillStyle = button.color;
    btn_panel.fillRect(button.x, button.y, button.width, button.height);
  }
}

btn_panel.canvas.addEventListener("touchend", controller.touchEnd, { passive: false });
btn_panel.canvas.addEventListener("touchmove", controller.touchMove, { passive: false });
btn_panel.canvas.addEventListener("touchstart", controller.touchStart, { passive: false });
