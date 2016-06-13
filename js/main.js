var callCount = 0;
$('#add-call').submit(function(event) {
    event.preventDefault();
    var name = $('input.name').val();
    var number = $('input.number').val();
    var time = $('input.time').val();
    var nameValid = false;
    var numberValid = false;
    var timeValid = false;

    if (name.length <= 30) {
        nameValid = true;
        if ($('input.name+.error.active')) {
            $('input.name+.error').removeClass('active');
        }
    } else {
        $('input.name+.error').addClass('active');
    }

    if ((/^[+][(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3}$/i).test(number) || (/^[0]{2}[\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3}$/i).test(number)) {
        numberValid = true;
        if ($('input.number+.error.active')) {
            $('input.number+.error').removeClass('active');
        }

        if ((/^[+]/i).test(number)) {
            number = number.replace("+", "00");
        }
        if (number.indexOf('(')) {
            number = number.replace('(', ' ');
        }
        if (number.indexOf(') ')) {
            number = number.replace(') ', ' ');
        }
        if (number.indexOf(')')) {
            number.replace(')', ' ');
        }
        if ((/[\s]/i).test(number)) {
            number = number.replace('-', ' ');
        }
        numberArr = number.split('');

        function addSpace(index) {
            if (numberArr[index] != ' ') {
                numberArr.splice(index, 0, " ");
            }
        }
        addSpace(2);
        addSpace(6);
        addSpace(10);
        addSpace(14);
        number = numberArr.join('');
    } else {
        $('input.number+.error').addClass('active');
    }

    if ((/^[0]{1}\d[:]{1}[0-6]{1}\d$/i).test(time) || (/^[1]{1}\d[:]{1}[0-6]{1}\d$/i).test(time) || (/^[2]{1}[0-4]{1}[:]{1}[0-6]{1}\d$/i).test(time)) {
        timeValid = true;
        if ($('input.time+.error.active')) {
            $('input.time+.error').removeClass('active');
        }

    } else {
        $('input.time+.error').addClass('active');
    }
    if (nameValid == true && numberValid == true && timeValid == true) {
        // $("#add-call").unbind('submit').submit();
        callCount = $('.calls tbody tr').length;
        var rowId = "row_" + callCount;
        var tr = $('<tr id="' + rowId + '"><td class="name">' + name + '</td><td class="number">' + number + '</td><td class="time">' + time + '</td><td class="delete"><a href="#">delete</a></td><td class="check"><form action=""><input type="checkbox"></form></td></tr>');
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
$('td.delete a').on('click', function() {
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
    var arr = []

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
