//WebRTC PeerConnection и DataChannel: Send picture
//https://habrahabr.ru/post/187270/

function SendPicture() {
    var pictureTransfers = 'pictureTransfers';
    var pictures = new Pictures(pictureTransfers);
    SendFile({
        header: '🖼 ' + lang.sendPicture//'Send Picture'⌗
        , informerFileTransfers: 'informerPictureTransfers'
        , fileTransfers: pictureTransfers
        , branchFileTransfers: pictures.branchPictureTransfers
        , noFileTransfer: pictures.noFileTransfer
        , fileInput: function (fileTransfer) {
            fileTransfer.showImage(fileTransfer.fileInput.files[0], {
                fileTransfer: fileTransfer
            });
        }
    });
}

