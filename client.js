function main() {
    submit(JSON.stringify(question));
}

function type(type, text, pos, sign='=') {
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
        case 'frac':
            mathField = MathQuill.MathField($('#expression-answer')[0]);
            mathField.latex("");
            mathField.write(text);
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
                    type(data.toType[i].type, data.toType[i].text, data.toType[i].pos, data.toType[i].sign);
                }
            }
        },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("error:" + textStatus + " " + errorThrown);
      }
   });
}

main();
