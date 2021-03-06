var tPosition = {line: 0, column: 0};
terminal = function(option){
  option = option || {data: []};
  option.data = option.data || [];
  option.timeout = option.timeout || 3000;
  var allString = 0;
  option.data.forEach(function(value){
    allString += value.command.length;
  });
  option.delay = option.timeout / allString;
  insertTerminal(option);
};

function insertTerminal(option){
  var terminalDom = "";
  option.data.forEach(function(value, index){
    if( tPosition.line > index ){
      terminalDom += "<span class='line'><span class='prefix'>" + value.prefix + "</span>";
      terminalDom += "<span class='command'>" + value.command + "</span></span>";
      if(value.result){
        terminalDom += "<span class='result'>" + value.result + "</span>";
      }
    }else if (tPosition.line == index){
      var cursor = (value.result && value.command.length == tPosition.column) ? "" : "<span class='cursor'>|</span>";
      terminalDom += "<span class='line'><span class='prefix'>" + value.prefix + "</span>";
      terminalDom += "<span class='command'>" + value.command.slice(0, tPosition.column) + cursor + "</span></span>";
    }
  });
  var isEnd = !option.data[tPosition.line] || (option.data[tPosition.line].command.slice(tPosition.column, tPosition.column + 1) == "");
  if(isEnd){
    tPosition.line += 1;
    tPosition.column = 0;
  }else{
    tPosition.column += 1;
  }
  $(option.dom).get(0).innerHTML = terminalDom;
  var isAllEnded = (option.data.length == tPosition.line) && isEnd;
  if(isAllEnded){
    window.setTimeout(function(){
      var value = option.data[option.data.length - 1];
      if(value.result ){
        terminalDom += "<span class='result'>" + value.result + "</span>";
        $(option.dom).get(0).innerHTML = terminalDom;
      }
    }, option.delay)
  }else{
    var delay = option.delay;
    if(tPosition.column == 1){
      delay += 1000;
    }
    window.setTimeout(function(){
      insertTerminal(option)
    }, delay)
  }
  if(isEnd){
    window.setTimeout(function(){
      $(".terminal-player").scrollTop(10000);
    }, option.delay + 1)
  }
}

window.sr = new scrollReveal();

renderBackground = function(){
  var dotImg = new Image();
  dotImg.src = "./img/grey-darker.png";
  window.fromPix = 0;
  dotImg.onload = function(){
    renderCanvas(dotImg);
  }
};

renderCanvas = function(dotImg){
  var imgWidth = 397;
  var imgHeight = 322;
  var canvas = document.getElementById("bg-animation");
  canvas.width = parseInt(getComputedStyle(canvas).width, 10);
  canvas.height = parseInt(getComputedStyle(canvas).height, 10);
  var ctx = canvas.getContext("2d");
  ctx.drawImage(dotImg, 0, 0);
  var hCount = Math.floor(canvas.width / imgWidth) + 1;
  var vCount = Math.floor(canvas.height / imgHeight) + 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(function(){renderCanvas(dotImg)});
  for(var h = 0; h<=hCount; h++){
    for(var v = 0; v<=vCount; v++){
      window.fromPix = fromPix + 0.08; // adjust speed.
      if (fromPix >= imgHeight){
        window.fromPix = 0;
      }
      ctx.drawImage(dotImg, 0, 0, imgWidth, imgHeight, h*imgWidth, (v-1)*imgHeight+fromPix-1, imgWidth, imgHeight);
    }
  }
};

$(function() {
  $(".border-menu").click(function(){
    $("body").toggleClass("show");
  });
  if (!document.querySelector(".terminal-player pre code")){
    return false
  }
  terminal({
    data  : [
      {
        prefix: "[root@localhost ~]#",
        command: "hyperctl pull ubuntu:latest",
        result: "..."
      }, {
        prefix: "[root@localhost ~]#",
        command: "hyperctl run -t ubuntu"
      },{
        prefix: "root@ubuntu-2994825143:/#",
        command: "ls",
        result: '<div class="result" style="color:#0CB6DC;">bin   dev  home  lib64  mnt  proc  run   srv  <pre style="display:inline;color:#00D200;">tmp</pre>  var</div><div class="result" style="color:#0CB6DC;">boot  etc  lib   media  opt  root  sbin  sys  usr</div>'
      },{
        prefix: "root@ubuntu-2994825143:/#",
        command: "exit",
        result: "exit"
      }, {
        prefix: "[root@localhost ~]#",
        command: "hyperctl run -d ubuntu",
        result: "<div>POD id is pod-aEafFYramp</div><div>Time to run a POD is 143 ms</div>"
      },{
        prefix: "[root@localhost ~]#",
        command: "hyperctl list",
        result: "<div>POD ID              POD Name            VM name             Status</div><div>pod-CMLStRNiKG      ubuntu-2994825143                       succeeded</div><div>pod-aEafFYramp      ubuntu-3972307775   vm-TeLKCtGBcF       running</div>"
      },{
        prefix: "[root@localhost ~]#",
        command: "virsh list",
        result: "<div> Id    Name                           State</div><div>----------------------------------------------------</div><div> 104   vm-TeLKCtGBcF                  running</div>"
      },{
        prefix: "[root@localhost ~]#",
        command: ""
      }
    ],
    dom: ".terminal-player pre code",
    timeout: 5000
  });
  $(".install-wrapper .install-button, .install-wrapper input.install-input").click(function(e){
    $(e.currentTarget).parents(".install-wrapper").find(".install-input").select();
  });
  //renderBackground();
});
