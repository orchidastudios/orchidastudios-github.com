var messageY = this._messageWindow.y;
this.width = this.windowWidth();
this.height = this.windowHeight();
switch (positionType) {
case 0:
this.x = 0;
break;
case 1:
this.x = (Graphics.boxWidth - this.width) / 2;
break;
case 2:
this.x = Graphics.boxWidth - this.width;
break;
}
if (messageY >= Graphics.boxHeight / 2) {
this.y = messageY - this.height;
} else {
this.y = messageY + this._messageWindow.height;
}
};