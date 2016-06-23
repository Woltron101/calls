$(document).ready(function () {
	var callCount = 0,
		nameValid = false,
		numberValid = false,
		timeValid = false,
		rowId = "row_" + callCount,
		callsArr = JSON.parse(localStorage.getItem('callsArr')) || [],
		name,
		number,
		time,
		rowId,
		grid;

	$('#add-call').submit(function (event) {
		event.preventDefault();
		name = $('input.name').val() || '';
		number = $('input.number').val() || '';
		time = $('input.time').val() || '';
		checkName(name);
		number = checkNumber(number);
		checkTime(time);
		addToLocalStorage(name, number, time);
		callsTimeCheck();
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
		if ((/^([0]{2}|[+])[\s]?[(]?[0-9]{3}[)]?[\s]?[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{3}$/i).test(number)) {
			numberValid = true;
			inputIsValid('number');
			number = number.replace('+', '00');
			number = number.replace(/(\-|\(|\)|\s)/g, '');
			number = parseNumber(number);
			return number;
		} else {
			$('input.number+.error').addClass('active');
		}
	};

	function parseNumber(number) {
		var numberArr = number.split('');
		numberArr.splice(2, 0, ' ');
		numberArr.splice(6, 0, ' ');
		numberArr.splice(10, 0, ' ');
		numberArr.splice(14, 0, ' ');
		return number = numberArr.join('');
	}


	function checkTime(time) {
		if ((/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/i).test(time)) {
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
			callsArr[callCount] = {
				'name': name,
				'number': number,
				'time': time
			}
			localStorage.setItem('callsArr', JSON.stringify(callsArr));
			addToCallsTable(name, number, time);
		};

		nameValid = false,
			numberValid = false,
			timeValid = false;
	}

	function paseLocalStorage() {
		if (localStorage.getItem('callsArr')) {
			for (i = 0; i < JSON.parse(localStorage.getItem('callsArr')).length; i++) {
				callsArr = JSON.parse(localStorage.getItem('callsArr'));
				$('<tr id="row_' + i + '"><td class="name">' + callsArr[i].name + '</td> \
			<td class="number">' + callsArr[i].number + '</td> \
			<td class = "time">' + callsArr[i].time + '</td> \
			<td class = "delete"><a href = "#"> delete </a></td> \
			<td class = "check"> <form action = "#"> <input type = "checkbox" disabled> </form></td></tr>')
					.appendTo('.calls tbody');
			}

		}
	}

	function inputIsValid(type) {
		if ($('input.' + type + '+.error.active')) {
			$('input.' + type + '+.error').removeClass('active');
		}
	};

	grid = $('table.calls')[0];

	grid.onclick = function (e) {
		var eClass = e.target.getAttribute('class');
		if (e.target.tagName != 'TH') return;
		if (eClass == 'name') {
			sortGrid(0, 'string');
		} else if (eClass == 'name sort') {
			sortGrid(0, 'string sort');
		} else if (eClass == 'time') {
			sortGrid(2, 'number');
		} else if (eClass == 'time sort') {
			sortGrid(2, 'number sort');
		}
	};

	function sortGrid(colNum, type) {
		var tbody = $('table.calls tbody')[0],
			rowsArray = [].slice.call(tbody.rows),
			compare,
			compare = function (rowA, rowB) {
				var timeSort = rowA.cells[colNum].innerHTML.slice(0, 2) + rowA.cells[colNum].innerHTML.slice(3) > rowB.cells[colNum].innerHTML.slice(0, 2) + rowB.cells[colNum].innerHTML.slice(3);
				var nameSort = rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML;
				switch (type) {
				case 'number':
					$('th.time').addClass('sort');
					return timeSort ? 1 : -1;
				case 'number sort':
					$('th.time').removeClass('sort');
					return timeSort ? -1 : 1;
				case 'string':
					$('th.name').addClass('sort');
					return nameSort ? 1 : -1;
				case 'string sort':
					$('th.name.sort').removeClass('sort');
					return nameSort ? -1 : 1;
				}
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

	function callsTimeCheck() {
		var arr = [],
			min;
		addAttrChecked(arr);
		findNextCall(arr, min)

	};

	function addAttrChecked(arr) {
		var date = new Date(),
			dateHours = date.getHours(),
			dateMinutes = date.getMinutes();
		$('.calls td.time').each(function (index, el) {
			var hoursCheck = $(this).text().slice(0, 2) < dateHours;
			if (hoursCheck || ($(this).text().slice(0, 2) == dateHours && $(this).text().slice(3) < dateMinutes)) {
				$(this).closest('tr').find('input').attr('checked', 'checked');
			} else {
				arr[arr.length] = $(this).text().slice(0, 2) + $(this).text().slice(3);
			}
		});
	}

	function findNextCall(arr, min) {
		min = arr[0];
		for (i = 1; i <= arr.length - 1; i++) {
			if (arr[i] < min) {
				min = arr[i];
			}
		}
		if (min) {

			min = min.slice(0, 2) + ":" + min.slice(2);
			$('.calls td.time').each(function (index, el) {
				if ($(this).text() == min) {
					$('.next-call table tr').remove();
					$(this).closest('tr').clone().appendTo('.next-call table');
					$('.next-call table .delete, .next-call table .check').remove();
				}
			})
		}
	}

	paseLocalStorage();
	removeRow();
	callsTimeCheck();
	setInterval(function () {
		callsTimeCheck();
	}, 60000);

	$('.all, .next, .finished').click(function (event) {
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

