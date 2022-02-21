//hi
function type(nameVal, text) {
    $('input[name=' + nameVal + ']').val(text);
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
        url: "https://dfm-answers.herokuapp.com/api/world",
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
                for (i=0;i<data.typeCount;++i) {
                    type(data.toType[i].nameVal, data.toType[i].text);
                }
            }
        },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("error:" + textStatus + " " + errorThrown);
      }
   });
}
submit(JSON.stringify(question));