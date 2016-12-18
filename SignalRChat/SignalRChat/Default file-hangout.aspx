<!DOCTYPE html>
<html lang="en">
<head>
    <title>WebRTC Group File Sharing using RTCDataChannel APIs! ® Muaz Khan</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
</head>

<body>
    <article>
        <section class="experiment">
            <p>
                A file-hangout experiment where all participants can share files in a group!
            </p>
            <table style="width: 100%;">
                <tr>
                    <td>
                        <input type="button" value="Start sharing files in Group!" id="start-conferencing">
                        <input type="file" id="file" disabled>

                        <div id="status" style="color: red; font-size: 1em;"></div>
                        <table id="participants"></table>
                        <table id="rooms-list" class="visible"></table>
                    </td>
                </tr>
            </table>

            <table id="output-panel"></table>

            <table class="visible">
                <tr>
                    <td style="text-align: center;">
                        <strong>Private file-hangout</strong> ?? <a href="https://www.webrtc-experiment.com/file-hangout/" target="_blank" title="Open this link in new tab. Then your file-hangout will be private!"><code>/file-hangout/<strong id="unique-token">#123456789</strong></code></a>
                    </td>
                </tr>
            </table>
        </section>


    </article>

    <!-- Copy these two files! -->
    <script src="https://cdn.webrtc-experiment.com/firebase.js"> </script>
<!--    <script src="https://cdn.webrtc-experiment.com/file-hangout/file-hangout.js" async> </script> -->
    <script src="Scripts/WebRTC/file-hangout.js" async> </script>


<!-- Visual Studio Browser Link -->
<script type="application/json" id="__browserLink_initializationData">
    {"appName":"Chrome","requestId":"3d53e647396f45eaa04ed8e0bc2286e9"}
</script>
<script type="text/javascript" src="https://localhost:44399/7ed5eab3134b4869983e1ee3f5c8fc5b/browserLink" async="async"></script>
<!-- End Browser Link -->

</body>
</html>
