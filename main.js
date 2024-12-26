let localStream;
let remoteStream;
let localPeerConnection;
let remotePeerConnection;

let servers = {
  iceServers: [
    {
      urls:['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
    }
  ]
}

let init = async () => {
  localStream  = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
  document.getElementById('user-1').srcObject = localStream
}

let createOffer = async () => {
  localPeerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  document.getElementById('user-2').srcObject = remoteStream 

  localStream.getTracks().forEach((track) => {
    localPeerConnection.addTrack(track, localStream)
  })

  localPeerConnection.ontrack = async(event) => {
    event.streams[0].getTracks().forEach((track)=>{
      remoteStream.addTrack(track)
    })
  }

  localPeerConnection.onicecandidate = async(event) => {
    if (event.candidate) {
      document.getElementById('offer-sdp').value = JSON.stringify(localPeerConnection.localDescription)
    }
  }

  let offer = await localPeerConnection.createOffer()

  await localPeerConnection.setLocalDescription(offer)
  document.getElementById('offer-sdp').value = JSON.stringify(offer) 
}

let createAnswer= async () => {
  remotePeerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  document.getElementById('user-2').srcObject = remoteStream 

  localStream.getTracks().forEach((track) => {
    remotePeerConnection.addTrack(track, localStream)
  })

  remotePeerConnection.ontrack = async(event) => {
    event.streams[0].getTracks().forEach((track)=>{
      remoteStream.addTrack(track)
    })
  }

  remotePeerConnection.onicecandidate = async(event) => {
    if (event.candidate) {
      document.getElementById('answer-sdp').value = JSON.stringify(remotePeerConnection.localDescription)
    }
  }

  let offer = document.getElementById('offer-sdp').value
  if (!offer) return alert("Retrieve offer from peer first ...")

  offer = JSON.parse(offer)
  await remotePeerConnection.setRemoteDescription(offer)

  let answer = await remotePeerConnection.createAnswer()
  await remotePeerConnection.setLocalDescription(answer)

  document.getElementById("answer-sdp").value = JSON.stringify(answer)
}

let addAnswer = async() => {
  let answer = document.getElementById('answer-sdp').value
  if (!answer) return alert('Retrieve answer from peer first ...')

  answer = JSON.parse(answer)
  if (!localPeerConnection.currentRemoteDescription) {
    localPeerConnection.setRemoteDescription(answer)
  }
}

init();

document.getElementById('create-offer').addEventListener('click', createOffer)
document.getElementById('create-answer').addEventListener('click', createAnswer)
document.getElementById('add-answer').addEventListener('click', addAnswer)