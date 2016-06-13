// where is check for dom ready?
var callCount = 0; // we must live window object clean of custom variable as much as we can, instead use helper function to get count;
$('#add-call').submit(function(event) {
    event.preventDefault();
    var name = $('input.name').val() || '';// we should set default data in case when $('input.name') can be removed from html
    var number = $('input.number').val();
    var time = $('input.time').val();
    var nameValid = false;
    var numberValid = false;
    var timeValid = false;

    // it's better to use helper functions instead to put long logick on single submit handler, 
    // for example move code below to checkNameField function and call this function checkNameField()

    if (name.length <= 30) {
        nameValid = true;
        if ($('input.name+.error.active')) {
            $('input.name+.error').removeClass('active');
        }
    } else {
        $('input.name+.error').addClass('active');
    }

    // the same problem move code below to helper function
    if ((/^[+][(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3}$/i).test(number) 
        || (/^[0]{2}[\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3}$/i).test(number)) { // you must use only one regular pattern  

        numberValid = true;
        // warning, you use same logick as in the line 17, you should avoid duplication of code, move this to some helper function
        if ($('input.number+.error.active')) {
            $('input.number+.error').removeClass('active');
        }

        if ((/^[+]/i).test(number)) {
            number = number.replace("+", "00");
        }
        if (number.indexOf('(')) {
            number = number.replace('(', ' ');
        }
        if (number.indexOf(') ')) { // its better remove all spaces ' ' on the beggining and it's check will be unnesesary
            number = number.replace(') ', ' ');
        }
        if (number.indexOf(')')) {
            number.replace(')', ' ');
        }
        if ((/[\s]/i).test(number)) {
            number = number.replace('-', ' ');
        }
        numberArr = number.split('');

        function addSpace(index) { // move helper away from submit handler
            if (numberArr[index] != ' ') { // read comment on line 40 and you will not need this check/
                numberArr.splice(index, 0, " ");
            }
        }
        // its better to do all this formats inside the formatNumber func
        addSpace(2);
        addSpace(6);
        addSpace(10);
        addSpace(14);
        number = numberArr.join('');

    } else {
        $('input.number+.error').addClass('active');
    }

    if ((/^[0]{1}\d[:]{1}[0-6]{1}\d$/i).test(time) || 
        (/^[1]{1}\d[:]{1}[0-6]{1}\d$/i).test(time) || 
        (/^[2]{1}[0-4]{1}[:]{1}[0-6]{1}\d$/i).test(time)) { // you must use only one regular expression

        timeValid = true;// code dublication again
        if ($('input.time+.error.active')) {
            $('input.time+.error').removeClass('active');
        }

    } else {
        $('input.time+.error').addClass('active');
    }
    if (nameValid  && numberValid  && timeValid) { // chek for timeValid == true and timeValid is the same
        // $("#add-call").unbind('submit').submit(); // all trash should be deleted
        callCount = $('.calls tbody tr').length;
        var rowId = "row_" + callCount; // all var's should be declared on the top level of function
        // it better to write long expression of html in readable view
        var tr = $('<tr id="' + rowId + '"> \
                <td class="name">' + name + '</td> \
                <td class="number">' + number + '</td> \
                <td class="time">' + time + '</td> \
                <td class="delete"><a href="#">delete</a></td> \
                <td class="check"> \
                    <form action=""><input type="checkbox"></form> \
                </td></tr>');
        tr.appendTo('.calls tbody');
        $('#add-call')[0].reset();
        $('input.name').focus();
        callsTimeCheck();

        var callsObj = {
            rowId: {
                'name': name,
                'number': number,
                'time': time
            }
        }
        localStorage.setItem(rowId, JSON.stringify(callsObj.rowId))
    }

});
for (i = 0; localStorage.getItem('row_' + i) != null; i++) {
    console.log(('row_' + i))
    localKey = JSON.parse(localStorage.getItem('row_' + i));
    // the same problem as in 83 line
    $('<tr id="row_' + i + '"><td class="name">' + localKey.name + '</td><td class="number">' + localKey.number + '</td><td class="time">' + localKey.time + '</td><td class="delete"><a href="#">delete</a></td><td class="check"><form action=""><input type="checkbox"></form></td></tr>').appendTo('.calls tbody');
}

var grid = $('table.calls')[0];

grid.onclick = function(e) {
    if (e.target.tagName != 'TH') return;

    sortGrid(e.target.cellIndex, e.target.getAttribute('data-type'));
};

function sortGrid(colNum, type) {

    var tbody = $('table.calls tbody')[0];
    var rowsArray = [].slice.call(tbody.rows);
    var compare;

    switch (type) {
        case 'number':
            compare = function(rowA, rowB) {
                return rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) - rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3);
            };

            break;
        case 'string':
            compare = function(rowA, rowB) {
                return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1;
            };
            break;
    }
    rowsArray.sort(compare);
    grid.removeChild(tbody);

    for (var i = 0; i < rowsArray.length; i++) {
        tbody.appendChild(rowsArray[i]);
    }

    grid.appendChild(tbody);
}
$('td.delete a').on('click', function(event) {
    event.preventDefault();
    var removeRow = $(this).closest('tr');
    removeRow.remove();
    callsTimeCheck();
});



function callsTimeCheck() {
    var date = new Date();
    $('.calls td.time').each(function(index, el) {

        if ($(this).text().slice(0, 2) < date.getHours()) {
            $(this).closest('tr').find('input').attr('checked', 'checked');
        }
        if ($(this).text().slice(0, 2) == date.getHours() && $(this).text().slice(3) < date.getMinutes()) {
            $(this).closest('tr').find('input').attr('checked', 'checked');
        }
    });
    var arr = []; // please install code linter to omit mistakes

    $('.calls td.time').each(function(index, el) {
        if ($(this).text().slice(0, 2) > date.getHours() || $(this).text().slice(0, 2) == date.getHours() && $(this).text().slice(3) >= date.getMinutes()) {
            arr[index] = $(this).text().slice(0, 2) + $(this).text().slice(3);
        }
    })
    var min = arr[0];
    for (i = 0; i <= arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    min = min.slice(0, 2) + ":" + min.slice(2);
    $('.calls td.time').each(function(index, el) {
        if ($(this).text() == min) {
            $('.next-call table tr').remove();
            $(this).closest('tr').clone().appendTo('.next-call table');
            $('.next-call table .delete, .next-call table .check').remove();
        }
    })
}
callsTimeCheck();
setInterval(function() {
    callsTimeCheck();
}, 60000)
$('.all').on('click', function() {
    event.preventDefault();
    $('tr').removeClass('hidden')
});
$('.next').on('click', function() {
    event.preventDefault();
    $('tr').removeClass('hidden')
    $('input[checked="checked"]').closest('tr').addClass('hidden');
});
$('.finished').on('click', function() {
    event.preventDefault();
    $('tr').removeClass('hidden');
    $('input[type="checkbox"]').each(function(index, el) {
        if ($(this).attr('checked') != 'checked') {
            $(this).closest('tr').addClass('hidden');
            $('input[checked="checked"]').closest('tr').removeClass('hidden');
        }
    })
});
