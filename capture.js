

(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.
  var count = 0;
  var total_smile = 0;
  var width = 480;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream
  var check = true;
  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var stopbutton = null;

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    stopbutton = document.getElementById('stopbutton');

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function(err) {
      console.log("An error occurred: " + err);
    });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
      
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.
      
        if (isNaN(height)) {
          height = width / (4/3);
        }
      
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);

    startbutton.addEventListener('click', function(ev){
      check = false;

      var blinking = document.getElementById('borderCamera');
      blinking.setAttribute("style","background-color: red");
      var dot = document.getElementById('recordingDot');
      dot.className = "recordingDot Blink";

      takepicture();
      ev.preventDefault();
    }, false);
    
    stopbutton.addEventListener('click', function(ev){
      if (check == false) 
      {
        stoptaking();
        check = true;
        var blinking = document.getElementById('borderCamera');
        blinking.setAttribute("style","background-color: #ffffff");
        var dot = document.getElementById('recordingDot');
        dot.className = "recordingDot hidden";

      }
      ev.preventDefault();
    }, false);

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }
  
//   async function run(fileName){
//     // Imports the Google Cloud client library
//     const vision = require('@google-cloud/vision');

//     // Creates a client
//     const client = new vision.ImageAnnotatorClient();

//     //const fileName = 'C:/Users/chinh/Downloads/happy.jpg';

//     const [result] = await client.faceDetection(fileName);
//     const faces = result.faceAnnotations;
//     console.log('Faces:');
//     faces.forEach((face, i) => {
//     console.log(`  Face #${i + 1}:`);
//     console.log(`    Joy: ${face.joyLikelihood}`);
//     console.log(`    Anger: ${face.angerLikelihood}`);
//     console.log(`    Sorrow: ${face.sorrowLikelihood}`);
//     console.log(`    Surprise: ${face.surpriseLikelihood}`);
//     });
// }

async function run(fileName){
  let data = {
    "requests":[
      {
        "image":{
          "content": fileName
        },
        "features":[
          {
            "type":"FACE_DETECTION",
            "maxResults": 10
          }
        ]
      }
    ]
  }
  let key = 'ya29.A0ARrdaM-yQPKw4RNhI_Yjksp_WA9H9RFJczKwa8-T95y93tgNHdAuC5hJCxiZfiLAiG8CJqiGjM0cZtytkstEkxP_BCHW7E__Jne7rQJgnul0Yj8_vZz1073Qqft0r9B_Bw_gKkEgomCIvvpbZVYQsmjqy8dloQ';
  fetch(`https://vision.googleapis.com/v1/images:annotate`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json charset=utf-8',
          'Authorization': `Bearer ${key}`,
          'X-Goog-User-Project': "serene-bazaar-339719"
      },
      body: JSON.stringify(data),
  })
      .then(response => response.json())
      .then(response => {
          const faces = response.responses[0].faceAnnotations;
          console.log('hello', response.responses[0]);
          
          let cnt_joy = 0;

          for (let i = 0; i < faces.length; i++){
            if (faces[i].joyLikelihood.search("UNLIKELY") == -1) 
              cnt_joy++;


          };
          total_smile += cnt_joy;
          document.getElementById("joy").innerHTML = "Number of happy faces: " + cnt_joy;
          if (cnt_joy >= 2) 
            document.getElementById("spike").innerHTML = "YOU ARE DOING A GREAT JOB!!";
          else 
            document.getElementById("spike").innerHTML = "";
      });
}

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function taking(){
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
    
      var data = canvas.toDataURL('image/png').split(';base64,')[1];
      photo.setAttribute('src', data);
      run(data);
    } else {
      clearphoto();
    }
  
  }

  let nIntervId;
  
  function takepicture() {
    
    if (!nIntervId) {
      nIntervId = setInterval(taking, 1000);
    }
  }

  function stoptaking(){
    clearInterval(nIntervId);
    nIntervId = null; 
    count++;
    var list = document.getElementById('myDropdown');
    let s = "";
    
    if (count == 1){
      var myobj = document.getElementById('placeholder');
      myobj.remove();
    }
    s += "Lecture  #" + count + " has " + total_smile + " smiles\n";
    var entry = document.createElement('h3');
    var breakLine = document.createElement('hr');
    entry.appendChild(document.createTextNode(s));
    list.appendChild(entry);
    list.appendChild(breakLine);
    total_smile = 0;
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();


//"Your application has authenticated using end user credentials from the Google Cloud SDK or Google Cloud Shell which are not supported by the vision.googleapis.com. We recommend configuring the billing/quota_project setting in gcloud or using a service account through the auth/impersonate_service_account setting. For more information about service accounts and how to use them in your application, see https://cloud.google.com/docs/authentication/. If you are getting this error with curl or similar tools, you may need to specify 'X-Goog-User-Project' HTTP header for quota and billing purposes. For more information regarding 'X-Goog-User-Project' header, please check https://cloud.google.com/apis/docs/system-parameters."