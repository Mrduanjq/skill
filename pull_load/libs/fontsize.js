var winW = document.documentElement.clientWidth;
var winH = document.documentElement.clientHeight
if (winW > 750) {
  document.documentElement.style.fontSize = "100px";
} else {
  document.documentElement.style.fontSize = winW / 750 * 100 + "px";
}