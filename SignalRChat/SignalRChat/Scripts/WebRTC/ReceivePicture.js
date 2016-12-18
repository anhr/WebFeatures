//WebRTC PeerConnection и DataChannel: Receive picture

function ReceivePicture(user, fileTransfer) {
    var pictures = new Pictures(fileTransfer.fileTransfers);
    ReceiveFile(user, fileTransfer, {
        header: '🖼 ' + '<span id="header">' + lang.receivePicture + '</span>'//Receive picture from '⌗
        , headerReceive: lang.receivePicture//Receive picture from '
        , informerFileTransfers: 'informerPictureTransfers'
//        , fileTransfers: pictureTransfers
        , branchFileTransfers: pictures.branchPictureTransfers
        , noFileTransfer: pictures.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showImage(new window.Blob(fileTransfer.app.dataChannel.receiveBuffer));
        }
        , fileTransfers: fileTransfer.fileTransfers
    });
}



