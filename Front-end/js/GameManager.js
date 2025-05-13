
$(function() {
    const nickname = new URLSearchParams(location.search).get("nickname");
    const roomMaster = null;

    // 소켓 연결
    var socket = io.connect("http://195.168.9.139:8888");

    socket.on("connect", function () {
        socketID = socket.id;
        // 소켓 연결 후 유저 입장 메시지 전송
        socket.emit("inMsg", {
            "nickname": nickname,
            "msg": "입장했습니다.",
            "socketID": socket.id
        });
    });

    // 방장 여부 개인적으로 전달
    socket.on("hostStatus", function(isHost) {
        if (isHost) {
            $("#hostStatus").text("방장");
        }
    });

    // 출입, 퇴장 메시지 출력
    socket.on("inoutMsg", function(msg) {
      if (msg["msg"]) {
        $("#msgList").append(
            "<li><div class='inoutMsg'>" + msg["nickname"] + "님이 " + msg["msg"] + "</div></li>");
      }
      // 페이지 항상 맨 아래로 이동
      $(window).scrollTop($(document).height());
    });

    //나가기 버튼 누르면 로비 페이지로 나가기
    $("#backBtn").on("click", function() {
        window.location.href = "index.html";
    });

    // 메시지 전송
    $("#msgInput").on("keyup", function(e) {
        if (e.keyCode == 13) {
            var msg = $(this).val();

            if (msg == "") {
                return;
            }

            socket.emit('clnMsg', {
                "nickname": nickname,
                "msg": msg,
                "socketID": socketID
            });
            $(this).val('');
        }
    });


    let lastMsgNickname = null;

    // 서버에서 메시지 받기
    socket.on('srvMsg', function(msg) {
        let setTextArea = false;

        if (lastMsgNickname === msg["nickname"]) {
            setTextArea = true;
        }

        // 메세지 초기화
        let message = "";
        if (msg["socketID"] === socketID) {
            // 나의 메시지
            if (!setTextArea) {
                message = "<li><div class='myMsg'><div class='nickname'>나</div><div class='msgContent'>" + msg["msg"] + "</div></div></li>";
            } else {
                message = "<li><div class='myMsg'><div class='msgContent'>" + msg["msg"] + "</div></div></li>";
            }
          } else {
            // 상대방 메시지
            if (!setTextArea) {
                message = "<li><div class='msg'><div class='nickname'>" + msg["nickname"] + "</div><div class='msgContent'>" + msg["msg"] + "</div></div></li>";
            } else {
                message = "<li><div class='msg'><div class='msgContent'>" + msg["msg"] + "</div></div></li>";
            }
          }

        $("#msgList").append(message);

        // 마지막 닉네임 업데이트
        lastMsgNickname = msg["nickname"];
        

      // 페이지 항상 맨 아래로 이동
      $(window).scrollTop($(document).height());
    });

});

