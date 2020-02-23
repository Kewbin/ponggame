$('.mp_play_btn').on('click', function () {
    socket = io.connect('http://192.168.100.10:3000');
    player = new Player(100, c.height - 20, 50);
    name = $("#mp_name").val();
    var data = {
        x: player.x,
        name: name,
    };

    socket.emit('start', data);
    mp_play();
});

$('.mp_back_btn').on('click', function () {
    $("#mp_menu").css('display', 'none');
    $("#menu").css('display', 'block');
});

function mp_play() {
    multiplayer = 1;
    player = new Player(100, c.height - 20, 50);
    player2 = new Player2(100, 20, 50);
    ball = new Ball(c.width / 2 - 5, c.height / 2 - 5, 0);
    animate();
    controls();
    $("#menu").css("display", "none");
    $("#mp_menu").css("display", "none");
    $("#canv").css("display", "block");
    $(".scores").css("display", "block");
    $("#roomid").css("display", "block");

    socket.on('heartbeat', function (data) {
        //console.log(data);
        //player2.x = data;
        playerdata = data;
    });

    socket.on('gamestart', function (data) {
        for (var i = data.length - 1; i >= 0; i--) {
            var id = data[i].id;
            if (id == socket.id) {
                $("#myname").text(data[i].name)
            } else {
                $("#ename").text(data[i].name)
            }
        };
        $("#roomid").css('display', 'none');
    });

    socket.on('waiting', function (data) {
        $("#myname").text("")
        $("#ename").text("")
        $("#roomid").css('display', 'block');
    });

    socket.on('scoreupd', function (data) {
        if (playernum == 1) {
            score = data[0];
            e_score = data[1];
        } else {
            score = data[1];
            e_score = data[0];
        }
        $("#score").text(score);
        $("#e_score").text(e_score);
    });
    socket.on('updatedball', function (data) {
        //console.log(data);
        //player2.x = data;

        if (playernum == 1) {
            ball.x = data.x;
            ball.y = data.y;
            ball.dx = data.dx;
            ball.dy = data.dy;
            ball.speed = data.speed;
        }
        else {
            ball.x = 250 - ball.width - data.x;
            ball.y = 400 - ball.height - data.y;
            ball.dx = -data.dx;
            ball.dy = -data.dy;
            ball.speed = data.speed;
        }


    });
    socket.on('playernum', function (data) {
        playernum = data;
    });
}

var pressedleft;
var pressedright;

playerdata = [];

var socket;
var playernum;



arena = new Image();
arena.src = "neon.png";


var stop = 0;
var multiplayer = 0;

if (window.orientation == 90) {
    var hght = (innerHeight - 50) / 400;
} else if (window.orientation == 0) {
    var hght = (innerWidth - 50) / 250;
} else if (window.orientation == undefined) {
    var hght = (innerHeight - 50) / 400;
}

$("#canv").css("transform", "translate(-50%, -50%) scale(" + hght + ")");
$('#myname').css("left", "Calc(50% - " + 120 * hght + "px)");
$('#ename').css("left", "Calc(50% - " + 120 * hght + "px)");
var score = 0;
var e_score = 0;

function roundT(num) {
    return parseInt(32 * Math.floor(parseFloat(num) / 32))
}
var c = document.getElementById("canv");
var ctx = c.getContext("2d");
ctx.font = "30px Arial";
c.width = 250;
c.height = 400;

var pressed = [];

$("#p_left").on("touchstart", function () {
    pressedleft = 1;
});
$("#p_right").on("touchstart", function () {
    pressedright = 1;
});

$("#p_left").on("touchend", function () {
    pressedleft = 0;
});
$("#p_right").on("touchend", function () {
    pressedright = 0;
});

if (multiplayer == 1) {
    $("#p2_left").on("touchstart", function () {
        pressed.push(37)
    });
    $("#p2_right").on("touchstart", function () {
        pressed.push(39)
    });
    $("#p2_left").on("touchend", function () {
        index = pressed.indexOf(37)
        pressed.splice(index, 1);
    });
    $("#p2_right").on("touchend", function () {
        index = pressed.indexOf(39)
        pressed.splice(index, 1);
    });
}

$(document).keydown(function (e) {
    if (pressed.includes(e.which) === false) {
        pressed.push(e.which);
    }
});

$(document).keyup(function (e) {
    if (pressed.includes(e.which) === true) {
        index = pressed.indexOf(e.which);
        pressed.splice(index, 1);
    }
});

function controls() {
    if (pressed.includes(65)) { //left
        player.dx -= 1;
    };
    if (pressed.includes(68)) { //right
        player.dx += 1;
    };
    if (multiplayer == 1) {
        if (pressed.includes(37)) { //left
            player2.dx -= 1;
        };
        if (pressed.includes(39)) { //right
            player2.dx += 1;
        };
    }
    setTimeout(controls, 10);
}

function Ball(x, y, d) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.dx = d;
    this.dy = d;
    this.color = "#fff";
    this.speed = d;

    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fill();
    }

    this.update = function () {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.width >= c.width) {
            this.dx = -this.speed;
        } else if (this.x <= 0) {
            this.dx = this.speed;
        }

        if (multiplayer == 0) {

            if (this.y <= 0) {
                score += 1;
                $("#score").text(score);
                this.x = x;
                this.y = y;
                this.dx = -1;
                this.dy = -1;
                this.speed = 1;
            }
        }

        if (this.y + this.height >= c.height) {
            e_score += 1;
            this.x = x;
            this.y = y;
            this.dx = 1;
            this.dy = 1;
            this.speed = 1;
            $("#e_score").text(e_score);
            if (multiplayer == 1) {
                if (playernum == 1) {
                    data = [score, e_score];
                    balldata = {
                        dy: this.dy,
                        dx: this.dx,
                        x: this.x,
                        y: this.y,
                        speed: this.speed
                    }
                } else {
                    data = [e_score, score];
                    balldata = {
                        dy: -this.dy,
                        dx: -this.dx,
                        x: 250 - this.width - this.x,
                        y: 400 - this.height - this.y,
                        speed: this.speed
                    }
                }
                socket.emit('updatescore', data);
                socket.emit('updateball', balldata);
            }
        }

        if (this.y + this.height >= player.y &&
            this.y <= player.y + player.height &&
            this.x + this.width > player.x &&
            this.x < player.x + player.width) {
            if (this.speed < 10) {
                this.speed += 0.1;
            }
            if (player.dx < 0) {
                this.dx = -this.speed;
            } else if (player.dx > 0) {
                this.dx = this.speed;
            } else if (this.dx < 0) {
                this.dx = -this.speed;
            } else {
                this.dx = this.speed;
            }
            this.dy = -this.speed;
            if (playernum == 1) {
                data = {
                    dy: this.dy,
                    dx: this.dx,
                    x: this.x,
                    y: this.y,
                    speed: this.speed
                }
            } else {
                data = {
                    dy: -this.dy,
                    dx: -this.dx,
                    x: 250 - this.width - this.x,
                    y: 400 - this.height - this.y,
                    speed: this.speed
                }
            };
            if (multiplayer == 1) {
                socket.emit('updateball', data);
            }
        }

        if (multiplayer == 0) {

            if (this.y + this.height >= enemy.y &&
                this.y <= enemy.y + enemy.height &&
                this.x + this.width > enemy.x &&
                this.x < enemy.x + enemy.width) {
                if (this.speed < 10) {
                    this.speed += 0.1;
                }
                if (this.dx < 0) {
                    this.dx = -this.speed;
                } else {
                    this.dx = this.speed;
                }
                this.dy = this.speed;
            }
        }



        this.draw();
    }
}

function Enemy(x, y, width, max_d) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 5;
    this.dx = 0;
    this.max_d = max_d;
    this.color = "#fff";



    this.update = function () {

        if (this.x + this.width / 2 < ball.x + ball.width / 2) {
            if (ball.y < c.height / 2) {
                if (ball.dx < this.max_d) {
                    this.dx = ball.speed;
                } else {
                    this.dx = this.max_d;
                }
            } else {
                this.dx = 1;
            }
        } else if (this.x + this.width / 2 > ball.x + ball.width / 2) {
            if (ball.y < c.height / 2) {
                if (ball.dx > -this.max_d) {
                    this.dx = -ball.speed;
                } else {
                    this.dx = -this.max_d;
                }
            } else {
                this.dx = -1;
            }
        }

        //enemy wall collision
        if (this.x + this.width >= c.width && this.dx > 0) {
            this.dx = 0;
        } else if (this.x <= 0 && this.dx < 0) {
            this.dx = 0
        }

        this.x += this.dx;
        this.draw();
    }
    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fill();
    }
}



function Player(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 5;
    this.dx = 0;
    this.color = "#fff";



    this.update = function () {
        if (this.dx > 3) {
            this.dx = 3;
        }
        if (this.dx < -3) {
            this.dx = -3;
        }

        if (pressedleft == 1) {
            this.dx -= 1;
        }
        if (pressedright == 1) {
            this.dx += 1;
        }

        if (this.x + this.width >= c.width && this.dx > 0) {
            this.dx = 0;
        } else if (this.x <= 0 && this.dx < 0) {
            this.dx = 0
        }

        if (!pressed.includes(65) && !pressed.includes(68) || pressedleft == 0 && pressedright == 0) {
            if (this.dx > 0) {
                this.dx -= 0.5;
            } else if (this.dx < 0) {
                this.dx += 0.5;
            }
        }
        this.x += this.dx;
        this.draw();
    }


    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fill();
        if (multiplayer == 1) {
            data = this.x;
            socket.emit('update', data);
        }
    }
}

function Player2(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 5;
    this.dx = 0;
    this.color = "#fff";



    this.update = function () {
        if (this.dx > 3) {
            this.dx = 3;
        }
        if (this.dx < -3) {
            this.dx = -3;
        }

        if (this.x + this.width >= c.width && this.dx > 0) {
            this.dx = 0;
        } else if (this.x <= 0 && this.dx < 0) {
            this.dx = 0
        }



        if (!pressed.includes(37) && !pressed.includes(39)) {
            if (this.dx > 0) {
                this.dx -= 0.5;
            } else if (this.dx < 0) {
                this.dx += 0.5;
            }
        }
        this.x += this.dx;
        this.draw();
    }


    this.draw = function () {
        for (var i = playerdata.length - 1; i >= 0; i--) {
            var id = playerdata[i].id;
            if (id !== socket.id) {
                ctx.fillStyle = this.color;
                this.x = 250 - this.width - playerdata[i].x;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.fill();
            }
        }

    }
}

function animate() {
    if (stop == 0) {
        requestAnimationFrame(animate);
    }

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(arena, 0, 0, c.width, c.height);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, c.height / 2 - 1, c.width, 2);
    ctx.fill();
    player.update();
    if (multiplayer == 1) {
        player2.update();
    } else {
        enemy.update();
    }
    ball.update();

}

//animate();
//controls();

$(".easy").on("click", function () {
    multiplayer = 0;
    player = new Player(100, c.height - 20, 50);
    enemy = new Enemy(100, 20, 50, 1);
    ball = new Ball(c.width / 2, c.height / 2, 1);
    animate();
    controls();
    $("#menu").css("display", "none");
    $("#canv").css("display", "block");
    $("#stop").css("display", "block");
    $(".scores").css("display", "block");
    $("#ename").text("EASY");
});

$(".normal").on("click", function () {
    multiplayer = 0;
    player = new Player(100, c.height - 20, 50);
    enemy = new Enemy(100, 20, 50, 3);
    ball = new Ball(c.width / 2, c.height / 2, 1);
    animate();
    controls();
    $("#menu").css("display", "none");
    $("#canv").css("display", "block");
    $("#stop").css("display", "block");
    $(".scores").css("display", "block");
    $("#ename").text("NORMAL");
});

$(".hard").on("click", function () {
    multiplayer = 0;
    player = new Player(100, c.height - 20, 50);
    enemy = new Enemy(100, 20, 50, 5);
    ball = new Ball(c.width / 2, c.height / 2, 1);
    animate();
    controls();
    $("#menu").css("display", "none");
    $("#canv").css("display", "block");
    $("#stop").css("display", "block");
    $(".scores").css("display", "block");
    $("#ename").text("HARD");
});

$(".impossible").on("click", function () {
    multiplayer = 0;
    player = new Player(100, c.height - 20, 50);
    enemy = new Enemy(100, 20, 50, 8);
    ball = new Ball(c.width / 2, c.height / 2, 1);
    animate();
    controls();
    $("#menu").css("display", "none");
    $("#canv").css("display", "block");
    $("#stop").css("display", "block");
    $(".scores").css("display", "block");
    $("#ename").text("IMPOSSIBLE");
});

$(".multiplayer").on("click", function () {
    $("#mp_menu").css('display', 'block');
    $("#menu").css('display', 'none');
});

$("#stop").on("click", function () {
    stop = 1;
    $("#stop_menu").css("display", "block");
});

$(".continue").on("click", function () {
    $("#stop_menu").css("display", "none");
    stop = 0;
    animate();
});

$(".tomenu").on("click", function () {
    $("#stop_menu").css("display", "none");
    $("#canv").css("display", "none");
    $("#stop").css("display", "none");
    $("#menu").css("display", "block");
    $(".scores").css("display", "none");
    $("#ename").text("");
    stop = 0;
    score = 0;
    e_score = 0;
    $("#score").text(score);
    $("#e_score").text(e_score);
});