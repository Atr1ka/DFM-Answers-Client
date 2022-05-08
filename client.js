function main() {
    if (window.location.pathname === "/live-participant-new.php") {
        let delay, mode = prompt("mode: type '0' for infinte points, '1' for immediately answer all questions without infinite points, '2' for answer with custom delay");
        if (mode==2) delay = prompt("enter delay time in ms (1000ms = 1s)");
        if (mode==0) delay = prompt("enter delay between submitting answers in ms \n(note do not do anything too low (200ms is recommended) as each response takes a while and may well crash the live if too fast. \nIf it gets too heavy reload (or just close if it freezes) the page to stop)");
        dfmLive(mode, delay);
    }
    else
        submit(JSON.stringify(question));

}
function type(alertString, type, text, pos, sign='=') {
    if (typeof mathField === 'undefined') var mathField;
    switch (type) {
        case 'input':
            $('input[name=' + pos + ']').val(text);
            break;
        case 'exp': 
            mathField = MathQuill.MathField($('.eqnsolutions-answerinput')[pos]);
            try {
                mathField.latex("");
            }
            catch(e) {
                mathField = MathQuill.MathField($('#expression-answer')[pos]);
                mathField.latex("")
            }
            mathField.write(text);
            if (sign !== '=') {
                $(".solution-rows").find($("select"))[pos].value = sign;
            }
            break;
        case 'coords':
            mathField = MathQuill.MathField($('.expression-answer-' + pos)[0]);
            mathField.latex("");
            mathField.write(text);
            break;
        case 'fraction':
            try {
                $('input[name=' + pos + ']').val(text);
            }
            catch(e) {
                alert(alertString);
            }
            break;
        case 'mcq':
            $('input:radio[name="multiplechoice-answer[]"][value="' + text + '"]').attr('checked',true);
            break;
        case 'vector': 
            mathField = MathQuill.MathField($('.expression-answer-cell')[pos]);
            mathField.latex("");
            mathField.write(text);
            break;
        case 'stdform': 
            mathField = MathQuill.MathField($('.expression-answer-' + pos)[0]);
            mathField.latex("");
            mathField.write(text);
            break;
        case 'list': 
            $('input[name="list-answer"]').val(text);
            break;
        case 'ordered': 
            // need to invert the array to work with the method i found
            // by invert I mean the new array is [index of number 1 in original array, index of number 2 in original array...]
            let invAns = [];
            for (let i=0;i<text.length;++i) {
                invAns[i] = text.indexOf(i+1);
            }
            $("#question-form-1").find(".answer-content").children().each(function(i){
                $(this).data("order", invAns[i]+1);
             });
            alert("For these type of questions, it has worked and your answer will be marked correct but it will not move the items around on screen due to how it is written.")
            break;
        case 'shape':
            $(".question-canvas").data("tempShape", text);
            $(".question-canvas").dfmCanvas("finishDrawing");
            break;
        case 'ratio':
            $(".answer-content").find(".expression-answer-ratio").each(function(i){
                $(this).algebraicInput("latex", text[i]);
           })
           break;
    }
}

function clearMQC() {
    for (let i=0;i<$('input:radio[name="multiplechoice-answer[]"]').length;++i)
        $('input:radio[name="multiplechoice-answer[]"][value="' + i + '"]').attr('checked',false);
}

function cleanJSON(og) {
    let out = "";
    for (i=0;i<og.length;++i) {
        if (og.at(i)=='"') {
            out += '\"'
        }
        else {
            out += og.at(i);
        }
    }
    return out;
}
 
function submit(str) {
    $.ajax({
        type: "POST",
        url: "https://atrika.herokuapp.com/api/world",
        contentType:"application/json",
        processData: false,
        cache: false,
        data: JSON.stringify({"qJSON":cleanJSON(str)}),
        success: function(data)
        {
            data = JSON.parse(data);
            console.log(data);
            if (data.typeCount == 0)
                alert(data.alertString);
            else {                   
                if (typeof MathQuill.getInterface == 'function') {
                    MathQuill = MathQuill.getInterface(1);
                }
                if (question.answer.type === 'multiplechoice')
                    clearMQC();
                for (i=0;i<data.typeCount;++i) {
                    type(data.alertSting, data.toType[i].type, data.toType[i].text, data.toType[i].pos, data.toType[i].sign);
                }
            }
        },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("error:" + textStatus + " " + errorThrown);
      }
   });
}


function dfmLive(mode, delay) {
    let ans;
    correctMessages[0] = "You may have hacked, but well done still";
    // only the part where status == question has been changed below, the rest is copy pasted from dfm 
        conn2.onmessage = function(e) {
        console.log(e.data);
        var msg = JSON.parse(e.data);
        if(msg.status==="evicted") {
           $("#game-area").html("<h1>Your name was considered too inappropriate.</h1><br><br><a href='live-joinauthenticate-new.php?gid="+participant.gid+"' class='very-large-button'>Join Again</a>");
           $('.hub-bg').animate({
              backgroundColor: incorrectColor,
           }, 1000 );
 
        } else if(msg.status==="question") {
            x=false;
            // on seing question, submit correct answer immediatly
            // format answer if only one box
            if (msg.question.answer.type === "multiplechoice") {
                ans = msg.question.answer.correctAnswer.toString();
            }
            else if (msg.question.answer.type === "eqnsolutions") {
                ans = msg.question.answer.correctAnswer;
            }
            else if (msg.question.answer.type === "table") {
                ans = msg.question.answer.correctAnswer;
                for (let i=0; i < ans.length; ++i) {
                    for (let j=0; j < ans[i].length; ++j) {
                        if (ans[i][j] !== "") {
                            ans[i][j] = ans[i][j].split(", ");
                        }
                    }
                }
                console.log(ans);
            }
            else if (msg.question.answer.type === "fraction") {
                ans = msg.question.answer.correctAnswer;
            }
            else if (msg.question.answer.type === "desmos_line" || msg.question.answer.type === "desmos" ) { // doesnt work yet for all types 
               ans = msg.question.answer.correctAnswer;
            }
            else if (typeof msg.question.answer.correctAnswer === "object" && "main" in msg.question.answer.correctAnswer && !("power" in msg.question.answer.correctAnswer)) {
                ans = msg.question.answer.correctAnswer.main;
            }
            else if (msg.question.answer.type === "numeric") {
                ans = [];
                let acc = msg.question.answer.data.rows[0].accuracy;
                if (acc == "range") acc = "from";
                if (acc == "awrt") acc = "exact";
                for (e of msg.question.answer.correctAnswer)
                    ans.push(e[acc].toString());
            }
            else if (msg.question.answer.type === "expression") {
                let acc = msg.question.answer.data.rows[0].accuracy;
                if (acc == "range") acc = "from";
                if (acc == "awrt") acc = "exact";
                ans = msg.question.answer.correctAnswer[0][acc];
            }       
            else if (msg.question.answer.type === "textual") {
                ans = [];
                for (e of msg.question.answer.correctAnswer) {
                    let temp = e.split(" OR ");
                    ans.push(temp[0]);
                }
            }
            else {
                ans = msg.question.answer.correctAnswer;
            }
            x=true;
            if (mode==1) {
                conn2.send(JSON.stringify({
                    "status": "submitAnswer",
                    "pid": participant.pid,
                    "data": ans,
                    "qid": msg.question.id
                }));
            }
            else if (mode==2) {
                setTimeout(_ => {
                    conn2.send(JSON.stringify({
                        "status": "submitAnswer",
                        "pid": participant.pid,
                        "data": ans,
                        "qid": msg.question.id
                    }));
                }, delay)
            }
            else if (mode==0) {
                setInterval(_ => {
                    if (x) {
                        conn2.send(JSON.stringify({
                            "status": "submitAnswer",
                            "pid": participant.pid,
                            "data": ans,
                            "qid": msg.question.id
                        }));
                    }
                }, delay)
            }

        } else if(msg.status==="lookAtScreen") {
           $('.hub-bg').animate({
               backgroundColor: lookColor,
           }, 1000 );
           if(game.studentdisplay==1) {
              $("#game-area").html("<h1>Please listen to your teacher.</h1><p style='font-size:22px'>Correct Answer: <strong>"+showHTMLAnswer(msg.question, msg.question.answer.correctAnswer, false)+"</strong></p>");
              MathJax.typeset();
           } else {
              $("#game-area").html("<h1>LOOK AT THE SCREEN</h1>");
           }
           console.log(JSON.stringify(msg));
        } else if(msg.status==="alreadyanswered") {
           $('.hub-bg').animate({
               backgroundColor: lookColor,
           }, 1000 );
           $("#game-area").html("<h1>You've already answered the current question.</h1>");
        } else if(msg.status==="error") {
           $("#game-area").html("<h1>"+msg.message+"</h1>");
           $('.hub-bg').animate({
              backgroundColor: incorrectColor,
           }, 1000 );
        } else if(msg.status==="joined") {
           console.log("Participant id: "+participant.pid);
           if(msg.gameStatus===1)$("#game-area").html("<h1>Ready to Go! Waiting for the game to start...</h1><br><br><img src='/homework/img/rolling.svg'>");
           $("#error-window").slideUp();   
        } else if(msg.status==="completed") {
           gameEnded = true;
           conn2.close();
           clearInterval(pulseTimerId);
           $('.hub-bg').animate({
               backgroundColor: correctColor,
           }, 1000 );
 
           $("#game-area").html("<h1>How did you do?</h1><h2 class='pStanding'>"+ordinal_suffix_of(msg.rank)+"</h2><h3 class='pStanding'><strong>Score:</strong> "+msg.score+" points</h3>");
        } else if(msg.status==="answerResponse") {
           currentDisplay = 2;
           var data = msg.data;
           console.log(JSON.stringify(data));
           if(msg.isCorrect)$("#game-area").html("<h1 style='display:none'>"+correctMessages[Math.floor(Math.random()*correctMessages.length)]+"</h1><br><br><img src='/homework/img/live-correct.png'><br><br><small id='perfInfo' style='font-size:14px;font-weight:normal;color:#fff'></small>");
           else {
              $("#game-area").html("<h1 style='display:none'>"+incorrectMessages[Math.floor(Math.random()*incorrectMessages.length)]+"</h1><br><br><img src='/homework/img/live-incorrect.png'><br><br><small style='font-size:14px;font-weight:normal;color:#fff'>(If for any reason the next question on the board doesn't appear, just refresh this page)</small>");
           }
           $("#perfInfo").html("<strong>Time:</strong> "+Math.round(msg.time)+" secs<br><strong>Points for this question:</strong> "+msg.points+"<br><strong>Total points:</strong> "+msg.totalPoints);
 
           $('.hub-bg').animate({
              backgroundColor: msg.isCorrect ? correctColor : incorrectColor,
           }, 1000 );
           $("#game-area h1").slideDown();
        }
    };
    if (typeof $("#game-area").data("question") !== "undefined") {
        if (question.answer.type === "multiplechoice") {
            ans = question.answer.correctAnswer.toString();
        }
        else if (question.answer.type === "eqnsolutions") {
            ans = question.answer.correctAnswer;
        }
        else if (question.answer.type === "fraction") {
            ans = question.answer.correctAnswer;
        }
        else if (question.answer.type === "table") {
            ans = question.answer.correctAnswer;
            for (let i=0; i < ans.length; ++i) {
                for (let j=0; j < ans[i].length; ++j) {
                    if (ans[i][j] !== "") {
                        ans[i][j] = ans[i][j].split(", ");
                    }
                }
            }
            console.log(ans);
        }
        else if (question.answer.type === "desmos_line" || question.answer.type === "desmos" ) { // doesnt work yet in all cases
           ans = question.answer.correctAnswer;
        }
        else if (typeof question.answer.correctAnswer === "object" && "main" in question.answer.correctAnswer && !("power" in question.answer.correctAnswer)) {
            ans = question.answer.correctAnswer.main;
        }
        else if (question.answer.type === "numeric") {
            ans = [];
            let acc = question.answer.data.rows[0].accuracy;
            if (acc == "range") acc = "from";
            if (acc == "awrt") acc = "exact";
            for (e of question.answer.correctAnswer)
                ans.push(e[acc].toString());
        }
        else if (question.answer.type === "expression") {
            let acc = question.answer.data.rows[0].accuracy;
            if (acc == "range") acc = "from";
            if (acc == "awrt") acc = "exact";
            ans = question.answer.correctAnswer[0][acc];
        } 
        else if (question.answer.type === "textual") {
            ans = [];
            for (e of msg.question.answer.correctAnswer) {
                let temp = e.split(" OR ");
                ans.push(temp[0]);
            }
        }
        else {
            ans = question.answer.correctAnswer.toString();
        }


        x=true;
        if (mode==1) {
            conn2.send(JSON.stringify({
                "status": "submitAnswer",
                "pid": participant.pid,
                "data": ans,
                "qid": question.id
            }));
        }
        else if (mode==2) {
            setTimeout(_ => {
                conn2.send(JSON.stringify({
                    "status": "submitAnswer",
                    "pid": participant.pid,
                    "data": ans,
                    "qid": question.id
                }));
            }, delay)
        }
        else if (mode==0) {
            setInterval(_ => {
                if (x) {
                    conn2.send(JSON.stringify({
                        "status": "submitAnswer",
                        "pid": participant.pid,
                        "data": ans,
                        "qid": question.id
                    }));
                }
            }, 50)
        }
    }
}

main();
