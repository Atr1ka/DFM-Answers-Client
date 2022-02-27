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
        case 'standardform': 
            mathField = MathQuill.MathField($('.expression-answer-' + pos)[0]);
            mathField.latex("");
            mathField.write(text);
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
