var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 


const http = require('http').createServer();
const io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});

io.listen(8888); // 소켓 통신

const users = {};

io.on("connection", function(socket){
  
  console.log(`[접속] ${socket.id}`);

  // 방장 정보 저장
  const isHost = hostSocketId === null;
  if (isHost) { // 방장 없으면, 최초 접속한애를 방장으로
    hostSocketId = socket.id;
    socket.emit("hostStatus", true); // 방장 여부 개인적으로 전달
  }

  // 모든 클라에게 플레이어 정보 전달
  io.sockets.emit("playerListUpdate", getPlayerList());


  // 출입, 퇴장 메시지 전송
  socket.on("inMsg", function(msg) {
    console.log(`[메시지] ${JSON.stringify(msg)}`);
    io.sockets.emit("inoutMsg", msg);
    users[socket.id] = msg.nickname;
  });

  socket.on("disconnect", () => {
    const nickname = users[socket.id];
    if (nickname) {
      console.log(`[퇴장] ${nickname} (${socket.id})`);

      io.emit("inoutMsg", {
        "nickname": nickname,
        "msg": "연결이 끊어졌습니다.",
        "socketID": socket.id
      });
      const wasHost = socket.id === hostSocketId; // 나간놈이 방장?
      delete users[socket.id];

      // 방장이 나갔다면, 다음 유저를 자동 방장으로 지정
      if (wasHost) {
        const remainingIds = Object.keys(users); // 남은 유저 목록
        hostSocketId = remainingIds[0] || null; // 남은 유저 중 첫번째 유저를 방장으로

        if (hostSocketId) {
          io.to(hostSocketId).emit("hostStatus", true);
        }
      }
    }
  });

  // 실시간 채팅 소켓 통신
  socket.on('clnMsg', function(msg) {
    console.log(`[메시지] ${JSON.stringify(msg)}`);
    // 메세지가 너무 길면 줄바꿈
    if (msg.msg.length > 55) {
      msg.msg = msg.msg.replace(/(\w{55})(\w)/, '$1\n$2');
    }

    io.sockets.emit('srvMsg', msg);
  });

});

//


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
