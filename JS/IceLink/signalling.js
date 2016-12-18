
function Signalling(websyncServerUrl)
{
    //consoleLog('Signalling(' + websyncServerUrl + ')');
    // We're going to use WebSync for this example, but any real-time
    // messaging system will do (like SIP or XMPP). We use WebSync
    // since it works well with JavaScript and uses HTTP, which is
    // widely allowed. To use something else, simply replace the calls
    // to WebSync with calls to your library.
    this.websyncClient = null;
    this.websyncServerUrl = websyncServerUrl;

    // IceLink includes a WebSync client extension that will
    // automatically manage signalling for you. If you are not
    // using WebSync, set this to false to see how the event
    // system works. Use it as a template for your own code.
    this.useWebSyncExtension = true;

    this.conference = null;
    this.sessionId = null;
    
    this.sendOfferAnswerEvent = this.sendOfferAnswer.bind(this);
    this.sendCandidateEvent = this.sendCandidate.bind(this);
    this.receiveOfferAnswerOrCandidateEvent = this.receiveOfferAnswerOrCandidate.bind(this);
};

Signalling.prototype.start = function (callback)
{
    //consoleLog('Signalling.prototype.start()');
    this.websyncClient = new fm.websync.client(this.websyncServerUrl);

    //для сервера localhost надо закомментировать обе строки ниже

    //It is private key from
    //https://www.frozenmountain.com/portal
    //Also see https://support.frozenmountain.com/hc/en-us/community/posts/204958625-Getting-error-Could-Not-Connect-to-WebSync-801-Invalid-domain-name-
    //this.websyncClient.setDomainKey(new fm.guid('5fb3bdc2-ea34-11dd-9b91-3e6b56d89593')); // WebSync On-Demand

    //private key from https://www.frozenmountain.com/portal for 192.168.1.40 domain
    //Если я закоментирую эту строку, то я не смогу создать видеоконференцию на мобильном телефоне. Вместо этого я получу сообщение об ошибке
    //Could not connect to WebSync. 801::Invalid domain name
    //this.websyncClient.setDomainKey(new fm.guid('b508ca84-3b51-423d-b047-0f46553d69fc')); // WebSync On-Demand

    this.websyncClient.setAutoDisconnect({ synchronous: true });
    this.websyncClient.connect({
        onFailure: function(e)
        {
            if (!e.getIsReconnect())
            {
                callback('Could not connect to WebSync. ' + e.getException().message);
            }
            e.setRetry(false);
        },
        onSuccess: function ()
        {
            //consoleLog('Signalling.prototype.start() onSuccess');
            callback(null);
        }
    });
};

Signalling.prototype.stop = function (callback)
{
    //consoleLog('Signalling.prototype.stop()');
    this.websyncClient.disconnect({
        onComplete: function(e)
        {
            callback(null);
        }
    });
};

Signalling.prototype.attach = function (conference, sessionId, callback)
{
    //consoleLog('Signalling.prototype.attach(conference, ' + sessionId + ', callback)');
    var me = this;

    this.conference = conference;
    this.sessionId = sessionId;
        
    if (this.useWebSyncExtension)
    {
        // Manage the conference automatically using a WebSync
        // channel. P2P links will be created automatically to
        // peers that join the same channel.
        this.websyncClient.joinConference({
            conferenceChannel: '/' + this.sessionId,
            conference: this.conference,
            onFailure: function(e)
            {
                callback('Could not attach signalling to conference ' + me.sessionId + '. ' + e.getException().message);
            },
            onSuccess: function (e)
            {
                //consoleLog('Signalling.prototype.attach() onSuccess');
                callback(null);
            }
        });
    }
    else
    {
        // When the conference generates an offer/answer or candidate,
        // we want to send it to the remote peer immediately.
        this.conference.addOnLinkOfferAnswer(me.sendOfferAnswerEvent);
        this.conference.addOnLinkCandidate(me.sendCandidateEvent);
            
        // When we receive an offer/answer or candidate, we want to
        // inform the conference immediately.
        this.websyncClient.addOnNotify(me.receiveOfferAnswerOrCandidateEvent);
                        
        // Subscribe to a WebSync channel. When another client joins the same
        // channel, create a P2P link. When a client leaves, destroy it.
        this.websyncClient.subscribe({
            channel: '/' + this.sessionId,
            onFailure: function(e)
            {
                callback('Could not attach signalling to conference ' + me.sessionId + '. ' + e.getException().message);
            },
            onReceive: function(e) { },
            onSuccess: function(e)
            {
                //consoleLog('Signalling.prototype.attach() onSuccess');
                callback(null);
            },
            onClientSubscribe: function (e)
            {
                //consoleLog('Signalling.prototype.attach() onClientSubscribe');
                // Kick off a P2P link.
                var peerId = e.getSubscribedClient().getClientId().toString();
                var peerState = e.getSubscribedClient().getBoundRecords();
                me.conference.link(peerId, peerState);
            },
            onClientUnsubscribe: function (e)
            {
                //consoleLog('Signalling.prototype.attach() onClientUnsubscribe');
                // Tear down a P2P link.
                var peerId = e.getUnsubscribedClient().getClientId().toString();
                me.conference.unlink(peerId);
            }
        });
    }
};

Signalling.prototype.sendOfferAnswer = function (e)
{
    //consoleLog('Signalling.prototype.sendOfferAnswer(e)');
    this.websyncClient.notify({
        clientId: new fm.guid(e.getPeerId()),
        dataJson: e.getOfferAnswer().toJson(),
        tag: 'offeranswer:' + this.sessionId
    });
};

Signalling.prototype.sendCandidate = function (e)
{
    //consoleLog('Signalling.prototype.sendCandidate(e)');
    this.websyncClient.notify({
        clientId: new fm.guid(e.getPeerId()),
        dataJson: e.getCandidate().toJson(),
        tag: 'candidate:' + this.sessionId
    });
};

Signalling.prototype.receiveOfferAnswerOrCandidate = function (e)
{
    //consoleLog('Signalling.prototype.receiveOfferAnswerOrCandidate(e)');
    var peerId = e.getNotifyingClient().getClientId().toString();
    var peerState = e.getNotifyingClient().getBoundRecords();
    if (e.getTag() == 'offeranswer:' + this.sessionId)
    {
        this.conference.receiveOfferAnswer(fm.icelink.offerAnswer.fromJson(e.getDataJson()), peerId, peerState);
    }
    else if (e.getTag() == 'candidate:' + this.sessionId)
    {
        this.conference.receiveCandidate(fm.icelink.candidate.fromJson(e.getDataJson()), peerId);
    }
};

Signalling.prototype.detach = function (callback)
{
    //consoleLog('Signalling.prototype.detach()');
    var me = this;

    if (this.useWebSyncExtension)
    {
        // Leave the managed WebSync channel.
        this.websyncClient.leaveConference({
            conferenceChannel: '/' + this.sessionId,
            onFailure: function(e)
            {
                callback('Could not detach signalling from conference ' + me.sessionId + '. ' + e.getException().message);
            },
            onSuccess: function(e)
            {
                me.conference = null;
                me.sessionId = null;
                    
                callback(null);
            }
        });
    }
    else
    {
        // Unsubscribe from the WebSync channel.
        this.websyncClient.unsubscribe({
            channel: '/' + this.sessionId,
            onFailure: function(e)
            {
                callback('Could not detach signalling from conference ' + me.sessionId + '. ' + e.getException().message);
            },
            onSuccess: function(e)
            {
                me.conference.removeOnLinkOfferAnswer(me.sendOfferAnswerEvent);
                me.conference.removeOnLinkCandidate(me.sendCandidateEvent);
                me.websyncClient.removeOnNotify(me.receiveOfferAnswerOrCandidateEvent);

                me.conference = null;
                me.sessionId = null;
                    
                callback(null);
            }
        });
    }
};