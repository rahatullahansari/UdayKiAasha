
function show_status() {
  var status = null;
  // make hidden <pre> visible
  $('#server_status').text('waiting for the response from https://iris-cloud.com...');
  $('#server_status').show();
  // code to check server status
  var xmlhttp = new XMLHttpRequest();
  var url = "https://iris-cloud.com:8188/uniqbio/irisserver/";
  xmlhttp.open('GET',url,true);
  xmlhttp.send(null);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        status = xmlhttp.responseText;
        // set status data
        $('#server_status').text(status);
      }
      else {
         //alert("Error (server status) - " + xmlhttp.responseText);
         $('#server_status').text("ERROR - " + xmlhttp.responseText);
      }
    }
  };
}
// function to get oauth2 bearer access_token
function request_auth() {
  var bearer = null;
  $('#server_auth').text('waiting for the response from https://iris-cloud.com...');
  $('#server_auth').show();
  var setting = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'clientId': 'CLIENT-WEB-DEMO',        // your client_id
    'clientSecret': 'AyOZ3gLT35vzTEDk9mgqv2' }; // your client_secret

  var authHost     = "https://" + setting.host;
  var resourceHost = "https://" + setting.host;

  var tokenEndpoint = authHost + "/token";
  var authEndpoint = authHost + "/authorize";
  
  var xmlhttp = new XMLHttpRequest();
  var url = authEndpoint + '?grant_type=code&client_id='
        + setting.clientId + '&scope=all&redirect_uri=none';

  xmlhttp.open('GET',url,true);
  xmlhttp.send(null);

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {     
        var xmlhttp2 = new XMLHttpRequest();
        var url2 = tokenEndpoint + '?grant_type=authorization_code&client_id='
            + setting.clientId + '&client_secret='
            + setting.clientSecret + '&code=' + xmlhttp.responseText;

        xmlhttp2.open('POST',url2,true);
        xmlhttp2.send(null);
        xmlhttp2.onreadystatechange = function() {
          if (xmlhttp2.readyState == 4) {
            if ( xmlhttp2.status == 200) {
              // this is your oauth2 access token
              bearer = JSON.parse(xmlhttp2.responseText).access_token;
              $('#server_auth').text(bearer);
            }
            else {
              //alert("Error (server status) - " + xmlhttp2.responseText);
              $('#server_auth').text("ERROR - " + xmlhttp2.responseText);
            }
          }
        };
      }
      else {
         //alert("Error (server status) - " + xmlhttp.responseText);
         $('#server_auth').text("ERROR - " + xmlhttp.responseText);
       }
    }
  };
};

// function to create an Iris Signature from an eye image
// requires a valid oauth2 bearer access_token (see above example)
function gen_iris_signature(bearer) {
  var iris_sign = null;
  $('#img_processed').attr('src', null);
  $('.prompt1').text('Click here to see server response');
  $('.prompt1').hide();
  $('#iris_sign').text('waiting for the response from https://iris-cloud.com...');
  $('#iris_sign').show(); // unhide div to show access token
  var setting = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'eye1_image': '/images/eyes_l.jpg',        // sample image
    'eye2_image': '/images/eye2_480x320.jpg',        // sample image
    'param1': '' }; // parameters

  // service endpoint
  var url = 'https://' + setting.host + '/encode?access_token=' + bearer;
  var payload = '{\
"tag_device_id": "DEV220px",\
"image_count": 1,\
"process_only": false,\
"reason_encode": "enroll",\
"image_def": {\
  "width": 480,\
  "height": 360,\
  "eye_type": "left",\
  "image_tag": "image001",\
  "image_format": "jpg",\
  "gaze_flag": 0,  \
  "image_buffer" : {\
    "length": 33215 ,\
    "data": "[<?php echo $base64 ; ?>]"\
  }\
}}';
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('POST', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        // json response data contains processed iris image, meta-data and iris signature
        var json_response = JSON.parse(xmlhttp.responseText);
        iris_sign = JSON.stringify(json_response,null,2);   
		$('#iris_sign').hide(); // un-hide by clicking show repsonse	
        $('#iris_sign').text(iris_sign);
        $('#img_processed').attr('src', 'data:image/gif;base64,' 
            + json_response.iris_image_processed.image_buffer.data);
        $('#img_processed').show();
		$('.prompt1').show();
      }
      else {
        //alert("Error (server status) - " + xmlhttp.responseText);
        $('#iris_sign').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// performs 1:N iris identification
// requires previously encoded Iris Signature for left/right eyes for matching (probes)
// requires a valid oauth2 bearer access_token (see above example)
function identify_iris(bearer) {
  var match_results = null;
  $('#iris_identify').text('waiting for the response from https://iris-cloud.com...');
  $('#iris_identify').show(); // unhide div to show access token
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'signature_right': "rZx75GvoH62tiXR25AYuQ9h/nwfygEqk/W/vGSrfUP47d3CFm2CjN51+Eaw4MjDhuEueLompHSMmendtkIOKeQjMsEkXtQ5QgHarzfGOYK681is55yApA8TgnuJW1R5Kd8AKvhrFISX6s5xVXsmuO6wFtysyfVMZpooPVoJiTckVUmfqw13DXca+W9TooabjHbfBgnC/aM6/MEsvKGu41RdZeP5vAiE5za5rykG7qpdXX+exuoWw/5F71RPLXlIkQuGgm8/92ly4WF6u7Ga4WIQU4oldXW2XKxEjacApzB/88eX/dky3j+MsR5lDdOcV9nU6aTRohHvXzicoykVTsP6338pSmkfRTpEPg1xyus2PGaepPVYtcCm+/gH+Py8Jbwukgsnt8K1UhbEycG84VMwpaYu04P4BPEFrDWzFrO2Zlt/fDbRss3bdR6reWsrSXRE4mhvqAbUi/jq2YHjRqctRSuHxD9T/7LjhMwjOzJDlz6BatRGdK0qIQf1UX8s8Yg82D5HtyX49o3HlN8zjArFO/A4aGcKSSfckc6G0gvTU1pq17V5OcmG9vhBOuANo8N2+a5iYPCK5EduvJhOFe66PI5owUsMCM50fRyJSYjV/+iZJ6bHsxH+6d2tno/GwmazlnoX17ZjTn4V9oWzNe/TjV5Eg7gF39RzULIrcP3QQb2rq64jRtJUSPrHB+WWkznGteYNuv9LKu/crhx5FIHDQQt9Oxlb7CErEn3aClV+sZz8LVv6X8sWTLwhkGubBNgKhRgvMYHQKSvdul1e1DJrlUGgCgGkfMVd1tLDgKu/OZ+6EjxbzNGtAA3rvx6n59SLYfcGd2rwifyNaO5dLp/+nbk+eDYBnArQ8mMraXvNpS3DCgH/BzAGE1OtH3asOFznKDxZcOsDylvzcohu1z5JX8F0qpFwRTcPPa6znfzXk1vrho5jHVYWb0Xpk7+Byxr7bC8aPQaKqcmFN6W4FNhrFImyhkxu+0JvB2TyQDr8=",        // iris signature - right eye
    'signature_left': "f+RbHHk3t80bh9qu4zNbze/U/v8S5EXGNVvzrkhYBMzIdVj0MRdBSTDC16zJrUDb8yVwxRF/AcZd4QTL83ADa4BHrMGC9pj5kb1+GAQI2TNfPQNNU3HnqVpe9zU8M1ICOldYEe4BOcqp1pz5w2a09PQmYdX+4nmr6BQhZcjumSgWwiNnQyVP3a1p+81Nde9CMddFnyiWkH6RhOK4qxcQyBQtqGv4QvKZwpcT2VyaxpaVDofDCaopO9y3ejQ96EN69kxby7xHiNDjMFExG3L04Vzft2t+FdyAWAVLiPuCml4wjD9bplNXo8TVXrrDuqDfM0oHdghfJMx73Uoi0L+TObKCJcUOssiH0IDRU8Zg5UFI6VsNheJkktmWVCTIZ+ZvufHpu18uN8J7GS7jtHlue8oXGB7FVwiUYtcIQzcFy5BDA63W1rN/dxwKPA6RmxPigGi1obW3XB9SyS23H9MzvB8FIenImd5EIv05rt8gONXLqdTkbpE0Y6+r7VFvo9rnLZc4CmbVbe/B/R2e5e5TdfKyZFcJCnuVBmzaPZbE49j6iHqXCuKjLm+VYqlT3VIS75vYrRbnrtwLv3y32JR/yH3ILXv5qqSPfMEhwkctoQEgxqY7aoykJzlWPJ+BMv6UZ+ZZ5kGw3lCLfaWccoCdI+QICRm2ZbQ0wjH56x+++iVqEVP+QncmVPobOGwvDo4AVQ7HLaJ2WNZZ31lkcXgkptZsNmj4BqvioPSIfnCz2HfiijqhQlmUdNtoesleRpp9xo1Bd23BW0jGzxrGBVotVuaqc1Dx+ncvmGKtj69v03wVaDPu+XwM0TVTmtPzD46FVDlJ0uXL4hA8MwnU+Y7fXgNpdQmgj+rWBr0stKvBX6Zuxa8DGDXBR6zfr7eZL2n3RIaaJ0NLbi2hnmysxs7BAlGp95y8JwAgzbsiaQuwBja6JKwBCKztiR0qC5wt6cX85N+Dxm2KaZPDYgj3bkQSt9W03ZhXQ6uHVYYCj2aH8Rg=",        // iris signature - left eye
    'param1': '' }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/identify?access_token=' + bearer;
  var payload = '{ "iris_signature1": "' + params.signature_right 
    + '", "iris_signature2": "' + params.signature_left + '" }';
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('POST', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        match_results = JSON.stringify(json_response,null,2);
        $('#iris_identify').text(match_results);
      }
      else {
        //alert("Error (server status) - " + xmlhttp.responseText);
        $('#iris_identify').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// performs 1:1 iris verification
// requires previously encoded Iris Signature for left/right eyes for verification (probes)
// requires a valid oauth2 bearer access_token (see above example)
function verify_iris(bearer) {
  var verify_results = null;
  $('#iris_verify').text('waiting for the response from https://iris-cloud.com...');
  $('#iris_verify').show(); // unhide div to show verification result
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
  'subject_id' : "cede356e-30b3-4441-91ae-700d164b6df2",
    'signature_right': "rZx75GvoH62tiXR25AYuQ9h/nwfygEqk/W/vGSrfUP47d3CFm2CjN51+Eaw4MjDhuEueLompHSMmendtkIOKeQjMsEkXtQ5QgHarzfGOYK681is55yApA8TgnuJW1R5Kd8AKvhrFISX6s5xVXsmuO6wFtysyfVMZpooPVoJiTckVUmfqw13DXca+W9TooabjHbfBgnC/aM6/MEsvKGu41RdZeP5vAiE5za5rykG7qpdXX+exuoWw/5F71RPLXlIkQuGgm8/92ly4WF6u7Ga4WIQU4oldXW2XKxEjacApzB/88eX/dky3j+MsR5lDdOcV9nU6aTRohHvXzicoykVTsP6338pSmkfRTpEPg1xyus2PGaepPVYtcCm+/gH+Py8Jbwukgsnt8K1UhbEycG84VMwpaYu04P4BPEFrDWzFrO2Zlt/fDbRss3bdR6reWsrSXRE4mhvqAbUi/jq2YHjRqctRSuHxD9T/7LjhMwjOzJDlz6BatRGdK0qIQf1UX8s8Yg82D5HtyX49o3HlN8zjArFO/A4aGcKSSfckc6G0gvTU1pq17V5OcmG9vhBOuANo8N2+a5iYPCK5EduvJhOFe66PI5owUsMCM50fRyJSYjV/+iZJ6bHsxH+6d2tno/GwmazlnoX17ZjTn4V9oWzNe/TjV5Eg7gF39RzULIrcP3QQb2rq64jRtJUSPrHB+WWkznGteYNuv9LKu/crhx5FIHDQQt9Oxlb7CErEn3aClV+sZz8LVv6X8sWTLwhkGubBNgKhRgvMYHQKSvdul1e1DJrlUGgCgGkfMVd1tLDgKu/OZ+6EjxbzNGtAA3rvx6n59SLYfcGd2rwifyNaO5dLp/+nbk+eDYBnArQ8mMraXvNpS3DCgH/BzAGE1OtH3asOFznKDxZcOsDylvzcohu1z5JX8F0qpFwRTcPPa6znfzXk1vrho5jHVYWb0Xpk7+Byxr7bC8aPQaKqcmFN6W4FNhrFImyhkxu+0JvB2TyQDr8=",  // right eye
    'signature_left': "f+RbHHk3t80bh9qu4zNbze/U/v8S5EXGNVvzrkhYBMzIdVj0MRdBSTDC16zJrUDb8yVwxRF/AcZd4QTL83ADa4BHrMGC9pj5kb1+GAQI2TNfPQNNU3HnqVpe9zU8M1ICOldYEe4BOcqp1pz5w2a09PQmYdX+4nmr6BQhZcjumSgWwiNnQyVP3a1p+81Nde9CMddFnyiWkH6RhOK4qxcQyBQtqGv4QvKZwpcT2VyaxpaVDofDCaopO9y3ejQ96EN69kxby7xHiNDjMFExG3L04Vzft2t+FdyAWAVLiPuCml4wjD9bplNXo8TVXrrDuqDfM0oHdghfJMx73Uoi0L+TObKCJcUOssiH0IDRU8Zg5UFI6VsNheJkktmWVCTIZ+ZvufHpu18uN8J7GS7jtHlue8oXGB7FVwiUYtcIQzcFy5BDA63W1rN/dxwKPA6RmxPigGi1obW3XB9SyS23H9MzvB8FIenImd5EIv05rt8gONXLqdTkbpE0Y6+r7VFvo9rnLZc4CmbVbe/B/R2e5e5TdfKyZFcJCnuVBmzaPZbE49j6iHqXCuKjLm+VYqlT3VIS75vYrRbnrtwLv3y32JR/yH3ILXv5qqSPfMEhwkctoQEgxqY7aoykJzlWPJ+BMv6UZ+ZZ5kGw3lCLfaWccoCdI+QICRm2ZbQ0wjH56x+++iVqEVP+QncmVPobOGwvDo4AVQ7HLaJ2WNZZ31lkcXgkptZsNmj4BqvioPSIfnCz2HfiijqhQlmUdNtoesleRpp9xo1Bd23BW0jGzxrGBVotVuaqc1Dx+ncvmGKtj69v03wVaDPu+XwM0TVTmtPzD46FVDlJ0uXL4hA8MwnU+Y7fXgNpdQmgj+rWBr0stKvBX6Zuxa8DGDXBR6zfr7eZL2n3RIaaJ0NLbi2hnmysxs7BAlGp95y8JwAgzbsiaQuwBja6JKwBCKztiR0qC5wt6cX85N+Dxm2KaZPDYgj3bkQSt9W03ZhXQ6uHVYYCj2aH8Rg=",  // left eye
    'param1': '' }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/verify?access_token=' + bearer;
  var payload = '{ "subject_id": "' + params.subject_id 
        + '", "iris_signature1": "' + params.signature_right
        + '", "iris_signature2": "' + params.signature_left + '" }';
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('POST', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        verify_results = JSON.stringify(json_response,null,2);    
        $('#iris_verify').text(verify_results);
      }
      else {
        $('#iris_verify').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// performs iris signature comparison
// requires previously encoded Iris Signature for comparison
// requires a valid oauth2 bearer access_token (see above example)
function compare_signatures(bearer) {
  var compare_result = null;
  $('#iris_compare').text('waiting for the response from https://iris-cloud.com...');
  $('#iris_compare').show(); // unhide div to show comparison result
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'signature1': "rZx75GvoH62tiXR25AYuQ9h/nwfygEqk/W/vGSrfUP47d3CFm2CjN51+Eaw4MjDhuEueLompHSMmendtkIOKeQjMsEkXtQ5QgHarzfGOYK681is55yApA8TgnuJW1R5Kd8AKvhrFISX6s5xVXsmuO6wFtysyfVMZpooPVoJiTckVUmfqw13DXca+W9TooabjHbfBgnC/aM6/MEsvKGu41RdZeP5vAiE5za5rykG7qpdXX+exuoWw/5F71RPLXlIkQuGgm8/92ly4WF6u7Ga4WIQU4oldXW2XKxEjacApzB/88eX/dky3j+MsR5lDdOcV9nU6aTRohHvXzicoykVTsP6338pSmkfRTpEPg1xyus2PGaepPVYtcCm+/gH+Py8Jbwukgsnt8K1UhbEycG84VMwpaYu04P4BPEFrDWzFrO2Zlt/fDbRss3bdR6reWsrSXRE4mhvqAbUi/jq2YHjRqctRSuHxD9T/7LjhMwjOzJDlz6BatRGdK0qIQf1UX8s8Yg82D5HtyX49o3HlN8zjArFO/A4aGcKSSfckc6G0gvTU1pq17V5OcmG9vhBOuANo8N2+a5iYPCK5EduvJhOFe66PI5owUsMCM50fRyJSYjV/+iZJ6bHsxH+6d2tno/GwmazlnoX17ZjTn4V9oWzNe/TjV5Eg7gF39RzULIrcP3QQb2rq64jRtJUSPrHB+WWkznGteYNuv9LKu/crhx5FIHDQQt9Oxlb7CErEn3aClV+sZz8LVv6X8sWTLwhkGubBNgKhRgvMYHQKSvdul1e1DJrlUGgCgGkfMVd1tLDgKu/OZ+6EjxbzNGtAA3rvx6n59SLYfcGd2rwifyNaO5dLp/+nbk+eDYBnArQ8mMraXvNpS3DCgH/BzAGE1OtH3asOFznKDxZcOsDylvzcohu1z5JX8F0qpFwRTcPPa6znfzXk1vrho5jHVYWb0Xpk7+Byxr7bC8aPQaKqcmFN6W4FNhrFImyhkxu+0JvB2TyQDr8=",
    'signature2': "f+RbHHk3t80bh9qu4zNbze/U/v8S5EXGNVvzrkhYBMzIdVj0MRdBSTDC16zJrUDb8yVwxRF/AcZd4QTL83ADa4BHrMGC9pj5kb1+GAQI2TNfPQNNU3HnqVpe9zU8M1ICOldYEe4BOcqp1pz5w2a09PQmYdX+4nmr6BQhZcjumSgWwiNnQyVP3a1p+81Nde9CMddFnyiWkH6RhOK4qxcQyBQtqGv4QvKZwpcT2VyaxpaVDofDCaopO9y3ejQ96EN69kxby7xHiNDjMFExG3L04Vzft2t+FdyAWAVLiPuCml4wjD9bplNXo8TVXrrDuqDfM0oHdghfJMx73Uoi0L+TObKCJcUOssiH0IDRU8Zg5UFI6VsNheJkktmWVCTIZ+ZvufHpu18uN8J7GS7jtHlue8oXGB7FVwiUYtcIQzcFy5BDA63W1rN/dxwKPA6RmxPigGi1obW3XB9SyS23H9MzvB8FIenImd5EIv05rt8gONXLqdTkbpE0Y6+r7VFvo9rnLZc4CmbVbe/B/R2e5e5TdfKyZFcJCnuVBmzaPZbE49j6iHqXCuKjLm+VYqlT3VIS75vYrRbnrtwLv3y32JR/yH3ILXv5qqSPfMEhwkctoQEgxqY7aoykJzlWPJ+BMv6UZ+ZZ5kGw3lCLfaWccoCdI+QICRm2ZbQ0wjH56x+++iVqEVP+QncmVPobOGwvDo4AVQ7HLaJ2WNZZ31lkcXgkptZsNmj4BqvioPSIfnCz2HfiijqhQlmUdNtoesleRpp9xo1Bd23BW0jGzxrGBVotVuaqc1Dx+ncvmGKtj69v03wVaDPu+XwM0TVTmtPzD46FVDlJ0uXL4hA8MwnU+Y7fXgNpdQmgj+rWBr0stKvBX6Zuxa8DGDXBR6zfr7eZL2n3RIaaJ0NLbi2hnmysxs7BAlGp95y8JwAgzbsiaQuwBja6JKwBCKztiR0qC5wt6cX85N+Dxm2KaZPDYgj3bkQSt9W03ZhXQ6uHVYYCj2aH8Rg=",
    'param1': '' }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/compare?access_token=' + bearer;
  var payload = '{ "iris_signature1": "' + params.signature1
        + '", "iris_signature2": "' + params.signature2 + '" }';
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open('POST', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        compare_result = JSON.stringify(json_response,null,2);    
        $('#iris_compare').text(compare_result);
      }
      else {
        $('#iris_compare').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// enrolls a new Subject with reference Iris Signatures
// requires previously encoded Iris Signature for left/right eyes for reference (gallary)
// requires a valid oauth2 bearer access_token (see above example)
function enroll_subject(bearer) {
  var enroll_result = null;
  $('#enroll_subject').text('waiting for the response from https://iris-cloud.com...');
  $('#enroll_subject').show(); // unhide div to show enroll result
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'subject_id' : "cede356e-30b3-4441-91ae-700d164b6df2",
    'signature_right': "rZx75GvoH62tiXR25AYuQ9h/nwfygEqk/W/vGSrfUP47d3CFm2CjN51+Eaw4MjDhuEueLompHSMmendtkIOKeQjMsEkXtQ5QgHarzfGOYK681is55yApA8TgnuJW1R5Kd8AKvhrFISX6s5xVXsmuO6wFtysyfVMZpooPVoJiTckVUmfqw13DXca+W9TooabjHbfBgnC/aM6/MEsvKGu41RdZeP5vAiE5za5rykG7qpdXX+exuoWw/5F71RPLXlIkQuGgm8/92ly4WF6u7Ga4WIQU4oldXW2XKxEjacApzB/88eX/dky3j+MsR5lDdOcV9nU6aTRohHvXzicoykVTsP6338pSmkfRTpEPg1xyus2PGaepPVYtcCm+/gH+Py8Jbwukgsnt8K1UhbEycG84VMwpaYu04P4BPEFrDWzFrO2Zlt/fDbRss3bdR6reWsrSXRE4mhvqAbUi/jq2YHjRqctRSuHxD9T/7LjhMwjOzJDlz6BatRGdK0qIQf1UX8s8Yg82D5HtyX49o3HlN8zjArFO/A4aGcKSSfckc6G0gvTU1pq17V5OcmG9vhBOuANo8N2+a5iYPCK5EduvJhOFe66PI5owUsMCM50fRyJSYjV/+iZJ6bHsxH+6d2tno/GwmazlnoX17ZjTn4V9oWzNe/TjV5Eg7gF39RzULIrcP3QQb2rq64jRtJUSPrHB+WWkznGteYNuv9LKu/crhx5FIHDQQt9Oxlb7CErEn3aClV+sZz8LVv6X8sWTLwhkGubBNgKhRgvMYHQKSvdul1e1DJrlUGgCgGkfMVd1tLDgKu/OZ+6EjxbzNGtAA3rvx6n59SLYfcGd2rwifyNaO5dLp/+nbk+eDYBnArQ8mMraXvNpS3DCgH/BzAGE1OtH3asOFznKDxZcOsDylvzcohu1z5JX8F0qpFwRTcPPa6znfzXk1vrho5jHVYWb0Xpk7+Byxr7bC8aPQaKqcmFN6W4FNhrFImyhkxu+0JvB2TyQDr8=",  // right eye
    'signature_left': "f+RbHHk3t80bh9qu4zNbze/U/v8S5EXGNVvzrkhYBMzIdVj0MRdBSTDC16zJrUDb8yVwxRF/AcZd4QTL83ADa4BHrMGC9pj5kb1+GAQI2TNfPQNNU3HnqVpe9zU8M1ICOldYEe4BOcqp1pz5w2a09PQmYdX+4nmr6BQhZcjumSgWwiNnQyVP3a1p+81Nde9CMddFnyiWkH6RhOK4qxcQyBQtqGv4QvKZwpcT2VyaxpaVDofDCaopO9y3ejQ96EN69kxby7xHiNDjMFExG3L04Vzft2t+FdyAWAVLiPuCml4wjD9bplNXo8TVXrrDuqDfM0oHdghfJMx73Uoi0L+TObKCJcUOssiH0IDRU8Zg5UFI6VsNheJkktmWVCTIZ+ZvufHpu18uN8J7GS7jtHlue8oXGB7FVwiUYtcIQzcFy5BDA63W1rN/dxwKPA6RmxPigGi1obW3XB9SyS23H9MzvB8FIenImd5EIv05rt8gONXLqdTkbpE0Y6+r7VFvo9rnLZc4CmbVbe/B/R2e5e5TdfKyZFcJCnuVBmzaPZbE49j6iHqXCuKjLm+VYqlT3VIS75vYrRbnrtwLv3y32JR/yH3ILXv5qqSPfMEhwkctoQEgxqY7aoykJzlWPJ+BMv6UZ+ZZ5kGw3lCLfaWccoCdI+QICRm2ZbQ0wjH56x+++iVqEVP+QncmVPobOGwvDo4AVQ7HLaJ2WNZZ31lkcXgkptZsNmj4BqvioPSIfnCz2HfiijqhQlmUdNtoesleRpp9xo1Bd23BW0jGzxrGBVotVuaqc1Dx+ncvmGKtj69v03wVaDPu+XwM0TVTmtPzD46FVDlJ0uXL4hA8MwnU+Y7fXgNpdQmgj+rWBr0stKvBX6Zuxa8DGDXBR6zfr7eZL2n3RIaaJ0NLbi2hnmysxs7BAlGp95y8JwAgzbsiaQuwBja6JKwBCKztiR0qC5wt6cX85N+Dxm2KaZPDYgj3bkQSt9W03ZhXQ6uHVYYCj2aH8Rg=",  // left eye
    // below are optional columns that can be saved along with enrollments
    // these columns needs to be defined in data store configuration file,
    // omit them if your installation does not need them
    "first_name": "John",
    "last_name": "Doe", 
    "date_of_birth": "1991-03-13",
    "xoptional": "<hello>world</hello>",
    "face_image": "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAC3ElEQVR42u2ah4ojMQyG5/2fLD0hhUB6J733Nss3MMexR45sIlsesj8Ylt2sR/rikWXJXiwW822MTCbjNxoNfzwe++v12j8ej/75fA4GP/M7/sZn+KwtuzzTD6hUKoFz9/vdf1Z8lv+pVqvRBVAsFv3tdvu004/EHIVCIVoAWq2Wf7vd3nY+FHMxZyQA9Pt9Mce/i7mdBsC3ZFrNZtNNALynksv+kXhGPp93D8BmszHufCh2CKcAsNXZVrlcdgfAcrm0DmA+n7sBgKztJ0mOlIgFyWRSH0CtVrPufChePXUAw+FQDcBgMNAHsFqt1ABIxIG3AXCS0xLnBHUA1+tVDQDw1QHYyP6cBvDxK+B0OqkBcCIGSBQ9XtVisdAHMJvN1ACQg6gD6PV6agAkqkRvA9A4CYYqlUr6ADgMaYjtN5FI6ANg7Pd76wCkiiIiADQORN1u1x0AVGdsS6pXIAIgHo8HLS5bksgARQHYfg3Yep0DwJK0IcpvuVzOPQAMG6VxCrCSNosCsFEflKgDGgNAMDR5OpQMfkYAMNrttjEA0n1BIwBIT01siawsidTXOACGiS5xZO4HhLFAslrMXMwZGQDSq8DUt28UQDqdFukZMofJW2NGb4kdDoe3ARD8TNroPAATe78VAKlUSqRpEtlXgM6tlCSqv1YBkLFJXppgLjJM5wGwVKfTqZjj30UPIpvNugeAWsBoNLLSJySucKmaq7hqAMjKqMlzc1Mi0r8qnk2swZZXM8WnAHAI4SGdTifox2l2hB8Jm7ANG7H12YPTQwAsMWpv1N817wC8KmzGdnz43+vyD4B6va7S6DAtfMK3hwCI4Davu2oJH/9OrLwwa9MMZraFr/j8B8BkMtG2ybrwOQBAjV3jqqu2wv6CZ7KI6brw3dO84qItfPd2u522HWrCd0/zmpu28N1zMa21JXz3opjmSgnfvU/cAkPh+y+Aj38FiISXy+UjB75/Adp+CJ9q5f4rAAAAAElFTkSuQmCC"
}; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/subject/' + params.subject_id + '?access_token=' + bearer;
  var payload = '{ "iris_signature1": "' + params.signature_right
        + '", "iris_signature2": "' + params.signature_left
        + '", "first_name": "' + params.first_name
        + '", "last_name": "' + params.last_name
        + '", "date_of_birth": "' + params.date_of_birth
        + '", "xoptional": "' + params.xoptional
        + '", "face_image": "' + params.face_image + '" }';
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  // this is a put call
  xmlhttp.open('PUT', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        enroll_result = JSON.stringify(json_response,null,2);    
        $('#enroll_subject').text(enroll_result);
      }
      else {
        $('#enroll_subject').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// deletes a new Subject from enrollment data store
// requires a valid oauth2 bearer access_token (see above example)
function delete_subject(bearer) {
  var delete_result = null;
  $('#delete_subject').text('waiting for the response from https://iris-cloud.com...');
  $('#delete_subject').show(); // unhide div to show delete result
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'subject_id' : "cede356e-30b3-4441-91ae-700d164b6df2"
  }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/subject/' + params.subject_id + '?access_token=' + bearer;
  // payload not required
  var payload = null;
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  // this is a put call
  xmlhttp.open('DELETE', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        delete_result = JSON.stringify(json_response,null,2);    
        $('#delete_subject').text(delete_result);
      }
      else {
        $('#delete_subject').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// retrieves an existing Subject from the enrollment data store
// requires a valid oauth2 bearer access_token (see above example)
function get_subject(bearer) {
  var get_result = null;
  $('#get_subject').text('waiting for the response from https://iris-cloud.com...');
  $('#get_subject').show(); // unhide div to show subject details
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'subject_id' : "cede356e-30b3-4441-91ae-700d164b6df2"
  }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/subject/' + params.subject_id + '?access_token=' + bearer;
  // payload not required
  var payload = null;
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  // this is a put call
  xmlhttp.open('GET', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        var json_response = JSON.parse(xmlhttp.responseText);
        if (json_response)
          get_result = JSON.stringify(json_response,null,2);
        else 
          get_result = xmlhttp.responseText;
        $('#get_subject').text(get_result);
      }
      else {
        $('#get_subject').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};

// checks for the existance of a given subject in enrollment data store
// requires a valid oauth2 bearer access_token (see above example)
function exists_subject(bearer) {
  $('#exists_subject').text('waiting for the response from https://iris-cloud.com...');
  $('#exists_subject').show(); // unhide div to show subject's existance
  var params = {
    'host': "iris-cloud.com:8188/uniqbio/irisserver", 
    'subject_id' : "cede356e-30b3-4441-91ae-700d164b6df2"
  }; // parameters

  // service endpoint
  var url = 'https://' + params.host + '/subject/' + params.subject_id + '?access_token=' + bearer;
  // payload not required
  var payload = null;
  
  // construct payload
  var xmlhttp = new XMLHttpRequest();

  // this is a HEAD call
  xmlhttp.open('HEAD', url, true);
  // add required headers
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.setRequestHeader('Accept', 'application/json');
  
  xmlhttp.send(payload);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if ( xmlhttp.status == 200) {
        $('#exists_subject').text("subject id=" + params.subject_id + " exist");
      }
      else if ( xmlhttp.status == 404) { // not found
        $('#exists_subject').text("subject id=" + params.subject_id + " does NOT exist");
      }
      else {
        $('#exists_subject').text("ERROR - " + xmlhttp.responseText);
      }
    }
  }
};