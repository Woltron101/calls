$(document).ready(function () {
	var name, number, time, rowId, grid; // use should use only one variable;
	var callCount = 0,
		nameValid = false,
		numberValid = false,
		timeValid = false,
		rowId = "row_" + callCount;

	$('#add-call').submit(function (event) {
		event.preventDefault();
		name = $('input.name').val() || '';
		number = $('input.number').val() || '';
		time = $('input.time').val() || '';
		checkName(name);
		number = checkNumber(number); // you can assign function result directly to variable number
		checkTime(time);
		addToLocalStorage(name, number, time);
	});

	function checkName(name) {
		if (name.length <= 30) {
			nameValid = true;
			inputIsValid('name');
		} else {
			$('input.name+.error').addClass('active');
		}
	};

	function checkNumber(number) {
		// phone number is to long you can write it 2 time shorter
		if ((/^([0]{2}[\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3})|([+][\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3})$/i).test(number)) {
			var numberArr;
			numberValid = true;
			inputIsValid('number');
			number = changeSymbol(number, '+', '00');

			// you can write three lines below in single line; becouse replace support regular expr, so write expression for this symbols "(", ")" and "-";
			number = changeSymbol(number, '(', '');
			number = changeSymbol(number, ')', '');
			number = changeSymbol(number, '-', '');

			numberArr = number.split('');

			// you should parse you number in one helper function;
			addSpace(numberArr, 2); 
			addSpace(numberArr, 6);
			addSpace(numberArr, 10);
			addSpace(numberArr, 14);
			return number = numberArr.join('');
		} else {
			$('input.number+.error').addClass('active');
		}
	};

	function changeSymbol(number, searchSym, changeSym) {
		if (number.indexOf(searchSym) >= 0) {
			return number.replace(searchSym, changeSym);
		} else {
			return number;
		}
	}

	function addSpace(numberArr, index) {
		if (numberArr[index] != ' ') {
			numberArr.splice(index, 0, " ");
		}
	}

	function checkTime(time) {
		// pattern can be more simply find in google js regular expression for time 24 hours
		if ((/^([0]{1}\d[:]{1}[0-5]{1}\d)|([1]{1}\d[:]{1}[0-5]{1}\d)|([2]{1}[0-4]{1}[:]{1}[0-5]{1}\d)$/i).test(time)) {
			timeValid = true;
			inputIsValid('time');
		} else {
			$('input.time+.error').addClass('active');
		}
	};

	function addToCallsTable(name, number, time) {
		var tr = $(
			'<tr id="' + rowId + '"> \
			<td class="name">' + name + '</td> \
			<td class="number">' + number + '</td> \
			<td class="time">' + time + '</td> \
			<td class="delete"><a href="#">delete</a></td> \
			<td class="check"><form action="#"><input type="checkbox" disabled></form></td></tr>');
		tr.appendTo('.calls tbody');
	};

	function addToLocalStorage(name, number, time) {
		if (nameValid && numberValid && timeValid) {
			callCount = $('.calls tbody tr').length;
			$('#add-call')[0].reset();
			$('input.name').focus();
			callsTimeCheck();
			rowId = "row_" + callCount;
			var callsObj = { // all vars should be on the top position;
				rowId: {
					'name': name,
					'number': number,
					'time': time
				}
			};
			localStorage.setItem(rowId, JSON.stringify(callsObj.rowId));
			addToCallsTable(name, number, time);
			nameValid = false,
				numberValid = false,
				timeValid = false;
		}
	};

	function paseLocalStorage() {
		for (i = 0; localStorage.getItem('row_' + i) != null; i++) {
			localKey = JSON.parse(localStorage.getItem('row_' + i));
			$('<tr id="row_' + i + '"><td class="name">' + localKey.name + '</td> \
			<td class="number">' + localKey.number + '</td> \
			<td class = "time">' + localKey.time + '</td> \
			<td class = "delete"><a href = "#"> delete </a></td> \
			<td class = "check"> <form action = "#"> <input type = "checkbox" disabled> </form></td></tr>')
				.appendTo('.calls tbody');
		}
	}

	function inputIsValid(type) {
		if ($('input.' + type + '+.error.active')) {
			$('input.' + type + '+.error').removeClass('active');
		}
	};
	// please move all logick 130-144 lines after helpers, for example 230 line;
	grid = $('table.calls')[0];

	grid.onclick = function (e) {
		var eClass = e.target.getAttribute('class');
		if (e.target.tagName != 'TH') return;
		if (eClass == 'name') {
			sortGrid(0, 'string');
		} else if (eClass == 'name sort') {
			sortGrid(0, 'string sort');
		} else if (eClass == 'time') {
			sortGrid(0, 'number');
		} else if (eClass == 'time sort') {
			sortGrid(2, 'number sort');
		}
	};

	function sortGrid(colNum, type) {
		var tbody = $('table.calls tbody')[0]; // use one var and one style for you code;
		var rowsArray = [].slice.call(tbody.rows);
		var compare;
		switch (type) {
		case 'number':
			$('th.time').addClass('sort');
			compare = function (rowA, rowB) {
				return rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) > rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3) ? 1 : -1;
			};
			break;
		case 'number sort':
			$('th.time').removeClass('sort');
			compare = function (rowA, rowB) {
				// what the difference with code on 154 line? you can write helper func and return reverted result on this case;
				return rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) > rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3) ? -1 : 1;
			};
			break;
		case 'string':
			$('th.name').addClass('sort');
			compare = function (rowA, rowB) {
				return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1;
			};
			break;
		case 'string sort':
			$('th.name.sort').removeClass('sort');
			compare = function (rowA, rowB) {
				// same problem like in 160 line;
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
	};

	function removeRow() {
		$('td.delete a').on('click', function (event) {
			var removeRow = $(this).closest('tr');
			event.preventDefault();
			removeRow.remove();
			callsTimeCheck();
		});
	};
	// this function is to complicated divedi it by parts
	function callsTimeCheck() {
		var min; // you should you single variable;
		var date = new Date(),
			dateHours = date.getHours(),
			dateMinutes = date.getMinutes(),
			arr = [];

		$('.calls td.time').each(function (index, el) { // for now app doesn't work because we don't have any $('.calls td.time')

			var hoursCheck = $(this).text().slice(0, 2) < dateHours;

			if (hoursCheck || (hoursCheck && $(this).text().slice(3) < dateMinutes)) {
				$(this).closest('tr').find('input').attr('checked', 'checked');
				arr[arr.length] = $(this).text().slice(0, 2) + $(this).text().slice(3);
			}
		});

		min = arr[0];
		for (i = 1; i < arr.length - 1; i++) {
			if (arr[i] < min) {
				min = arr[i];
			}
		}

		min = min.slice(0, 2) + ":" + min.slice(2);
		$('.calls td.time').each(function (index, el) { // same problem like in 204 line;
			if ($(this).text() == min) {
				$('.next-call table tr').remove();
				$(this).closest('tr').clone().appendTo('.next-call table');
				$('.next-call table .delete, .next-call table .check').remove();
			}
		})
	};

	paseLocalStorage();
	removeRow();
	callsTimeCheck();
	setInterval(function () {
		callsTimeCheck();
	}, 60000);

	$('.all, .next, .finished').click(function (event) {
		// move code below to helper with name what happen below;
		event.preventDefault();
		$('tr').removeClass('hidden');
		if ($(this)[0] == $('.next')[0]) {
			$('input[checked="checked"]').closest('tr').addClass('hidden');
		} else if ($(this)[0] == $('.finished')[0]) {
			$('input[type="checkbox"]').each(function (index, el) {
				if (!$(this).attr('checked')) {
					$(this).closest('tr').addClass('hidden');
					$('input[checked="checked"]').closest('tr').removeClass('hidden');
				}
			})
		}
	});
});
