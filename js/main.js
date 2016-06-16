$(document).ready(function() {
    var callCount = 0;
    $('#add-call').submit(function(event) {
        event.preventDefault();
        var name = $('input.name').val() || '';
        var number = $('input.number').val() || '';
        var time = $('input.time').val() || '';
        var nameValid = false;
        var numberValid = false;
        var timeValid = false;
        var rowId = "row_" + callCount;
        var checkName = function() {
            if (name.length <= 30) {
                nameValid = true;
                inputIsValid('name');
            } else {
                $('input.name+.error').addClass('active');
            }
        }();
        var checkNumber = function() {
            if ((/^([0]{2}[\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3})|([+][\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3})$/i).test(number)) {
                numberValid = true;
                inputIsValid('number');

                function changeSymbol(searchSym, changeSym) {
                    if (number.indexOf(searchSym) >= 0) {
                        number = number.replace(searchSym, changeSym);
                    }
                }
                changeSymbol('+', '00');
                changeSymbol('(', '');
                changeSymbol(')', '');
                changeSymbol('-', '');
                var numberArr = number.split('');

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
        }();
        var checkTime = function() {
            if ((/^([0]{1}\d[:]{1}[0-5]{1}\d)|([1]{1}\d[:]{1}[0-5]{1}\d)|([2]{1}[0-4]{1}[:]{1}[0-5]{1}\d)$/i).test(time)) {
                timeValid = true;
                inputIsValid('time');
            } else {
                $('input.time+.error').addClass('active');
            }
        }();

        function addToCallsTable() {

            var tr = $(
                '<tr id="' + rowId + '"> \
            				<td class="name">' + name + '</td> \
            				<td class="number">' + number + '</td> \
            				<td class="time">' + time + '</td> \
            				<td class="delete"><a href="#">delete</a></td> \
            				<td class="check"><form action="#"><input type="checkbox" disabled></form></td></tr>');

            tr.appendTo('.calls tbody');
        }
        var addToLocalStorage = function() {
            if (nameValid && numberValid && timeValid) {
                callCount = $('.calls tbody tr').length;
                $('#add-call')[0].reset();
                $('input.name').focus();
                callsTimeCheck();
                var callsObj = {
                    rowId: {
                        'name': name,
                        'number': number,
                        'time': time
                    }
                };
                localStorage.setItem(rowId, JSON.stringify(callsObj.rowId));
                addToCallsTable();
            }
        }()
    });

    for (i = 0; localStorage.getItem('row_' + i) != null; i++) {
        localKey = JSON.parse(localStorage.getItem('row_' + i));
        $('<tr id="row_' + i + '"><td class="name">' + localKey.name + '</td> \
	        <td class="number">' + localKey.number + '</td> \
	        <td class = "time">' + localKey.time + '</td> \
	        <td class = "delete"><a href = "#"> delete </a></td> \
	        <td class = "check"> <form action = "#"> <input type = "checkbox" \
	        disabled> </form></td></tr>')
            .appendTo('.calls tbody');
    }

    function inputIsValid(type) {
        if ($('input.' + type + '+.error.active')) {
            $('input.' + type + '+.error').removeClass('active');
        }
    }
    var grid = $('table.calls')[0];

    grid.onclick = function(e) {
        var eClass = e.target.getAttribute('class');
        if (e.target.tagName != 'TH') return;
        if (e.target.getAttribute('class') == 'name') {
            sortGrid(e.target.cellIndex, e.target.getAttribute('data-type'));
            $('th.name').addClass('sort');
        } else if (e.target.getAttribute('class') == 'name sort') {
            $('th.name.sort').removeClass('sort');
            sortGrid(0, 'string sort');
        } else if (e.target.getAttribute('class') == 'time') {
            sortGrid(e.target.cellIndex, e.target.getAttribute('data-type'));
            $('th.time').addClass('sort');
        } else if (e.target.getAttribute('class') == 'time sort') {
            sortGrid(2, 'number sort');
            $('th.time').removeClass('sort');

        }
    };

    function sortGrid(colNum, type) {

        var tbody = $('table.calls tbody')[0];
        var rowsArray = [].slice.call(tbody.rows);
        var compare;

        switch (type) {
            case 'number':
                compare = function(rowA, rowB) {
                    return rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) > rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3) ? 1 : -1;
                };
                break;
            case 'number sort':
                compare = function(rowA, rowB) {
                    return rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) > rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3) ? -1 : 1;
                };
                break;
            case 'string':
                compare = function(rowA, rowB) {
                    return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1;
                };
                break;
            case 'string sort':
                compare = function(rowA, rowB) {
                    return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? -1 : 1;
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
        var arr = []

        $('.calls td.time').each(function(index, el) {
            if ($(this).text().slice(0, 2) > date.getHours() || $(this).text().slice(0, 2) == date.getHours() && $(this).text().slice(3) >= date.getMinutes()) {
                arr[arr.length] = $(this).text().slice(0, 2) + $(this).text().slice(3);
            }
        })
        var min = arr[0];
        for (i = 1; i < arr.length - 1; i++) {
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
    }, 60000);
    $('.all').on('click', function(event) {
        event.preventDefault();
        $('tr').removeClass('hidden')
    });
    $('.next').on('click', function(event) {
        event.preventDefault();
        $('tr').removeClass('hidden')
        $('input[checked="checked"]').closest('tr').addClass('hidden');
    });
    $('.finished').on('click', function(event) {
        event.preventDefault();
        $('tr').removeClass('hidden');
        $('input[type="checkbox"]').each(function(index, el) {
            if ($(this).attr('checked') != 'checked') {
                $(this).closest('tr').addClass('hidden');
                $('input[checked="checked"]').closest('tr').removeClass('hidden');
            }
        })
    });

});
