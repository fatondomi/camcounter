
selectedMethodIsGet = true;

function getCBoxClicked(){
    document.getElementById("postCkBox").checked = false;
    document.getElementById("cntBox").style.background = "rgb(248, 248, 248)";
    document.getElementById("cntBox").style.border = "1px solid rgb(208, 208, 208)";
    document.getElementById("typeInput").disabled = true;
    document.getElementById("cntTxtSpace").style.color = "rgb(84,84,84)";
    selectedMethodIsGet = true;
}

function postCBoxClicked(){
    document.getElementById("getCkBox").checked = false;
    document.getElementById("cntBox").style.background = "white";
    document.getElementById("cntBox").style.border = "1px solid rgb(128, 128, 128)";
    document.getElementById("typeInput").disabled = false;
    document.getElementById("cntTxtSpace").style.color = "black";
    selectedMethodIsGet = false;
}

function sendPostReq(url,content,contentType)
{
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            document.getElementById("respTxtSpace").innerHTML = "\rstatus: " + this.status + "\r\rresponse:\r" + this.responseText;
        }
    };
    
    xhttp.open("POST",url,true);
    xhttp.setRequestHeader("Content-type", contentType);
    xhttp.send(content);
}

function sendGetReq(url)
{
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            document.getElementById("respTxtSpace").innerHTML = "\rstatus: " + this.status + "\r\rresponse:\r" + this.responseText;
        }
    };
    
    xhttp.open("GET",url,true);
    xhttp.send();
}


function sendBtnFun()
{
    if(selectedMethodIsGet)
    {
        sendGetReq(document.getElementById("urlInput").value.trim());
    }
    else
    {
        sendPostReq(document.getElementById("urlInput").value.trim(),
                    document.getElementById("cntTxtSpace").value,
                    document.getElementById("typeInput").value.trim());
    }
}