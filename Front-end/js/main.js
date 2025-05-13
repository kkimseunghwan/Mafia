$(function() {

    var nickname = "";
    var socketID = "";
    var socket;

    // 소켓 연결
    socket = io.connect("http://195.168.9.139:8888");

    socket.on("connect", function () {
        socketID = socket.id;
        console.log("소켓 연결됨:", socketID);
    });

    // 접속 및 페이지 이동
    $("#joinBtn").on("click", function (e) {
        e.preventDefault();

        nickname = $("#nicknameInput").val();
        if (nickname === "") {
            alert("닉네임을 입력해 주세요.");
            return;
        }

        $.mobile.changePage("#chattingPage", {
            transition: "slide",
            reverse: false
        });
    });

    //나가기 버튼 클릭 이벤트
    $("#backBtn").on("click", function (e) {
        e.preventDefault();

        $.mobile.changePage("#loginPage", {
            transition: "slide",
            reverse: true
        });
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

    // 서버에서 메시지 받기
    socket.on('srvMsg', function(msg) {
        if (msg["socketID"] == socketID) {
            // 자신 메시지
            $("#msgList").append("<li><div class='myMsg'><div class='nickname'>나</div><div class='msgContent'>" + msg["msg"] + "</div></div></li>");
        } else {
            // 상대방 메시지
            $("#msgList").append("<li><div class='msg'><div class='nickname'>" + msg["nickname"] + "</div><div class='msgContent'>" + msg["msg"] + "</div></div></li>");
        }

      // 페이지 항상 맨 아래로 이동
      $(window).scrollTop($(document).height());
    });

});