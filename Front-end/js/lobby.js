$(function() {

    // 입장 버튼 누르면
    $("#joinBtn").on("click", function() {
        const nickname = $("#nicknameInput").val();
        if (!nickname) return alert("닉네임을 입력해 주세요.");

        encodeURIComponent(nickname);
        window.location.href = `chattingPage.html?nickname=${nickname}`;
    });

});