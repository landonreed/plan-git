function replaceSpecialChars(str) {
	return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/"/g, "&quot;").replace(/&nbsp;/g, " ");
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
    	if (/LCI|CTP|TDM|CSX|MARTA|^FY$|^ARC$|^SR$|^II$|^STP$|^III$|^US$|CMAQ/g.test(txt))
    		return txt
    	else if (/^IN$|^OF$|^AND$|^FOR$/g.test(txt)){
    		return txt.toLowerCase()
    	}
    	else
    		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function populateSelect(element, array){
	var options = $(element);
	$.each(array, function(i, value) {
		// console.log("we're here")
		// console.log(value)
		options.append($("<option />").val(value).text(value));
	});
}
function strip(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function apiRemaining(){
	$.getJSON('https://api.github.com/rate_limit?access_token='+$.cookie('token'), function(data){console.log(data.rate.remaining)})
}

function tableToJson(table) { 
	var data = []; // first row needs to be headers 
	var headers = []; 
	var maxLength = {};
	for (var i=0; i<table.rows[0].cells.length; i++) {
		headers[i] = table.rows[0].cells[i].innerHTML.replace(/ /gi,'');
		maxLength[ headers[i] ] = headers[i].length
	} 
	// go through cells 
	for (var i=1; i<table.rows.length; i++) { 
		var tableRow = table.rows[i]; 
		var rowData = {}; 
		for (var j=0; j<tableRow.cells.length; j++) { 
			rowData[ headers[j] ] = replaceSpecialChars(tableRow.cells[j].innerHTML)
			if (tableRow.cells[j].innerHTML.length > maxLength[headers[j]])
				maxLength[ headers[j] ] = rowData[ headers[j] ].length
		} 
		data.push(rowData); 
	} 
	return [maxLength, data]; 
}
function exportResults(type) {
	var name = 'results.' + type
	var a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	// var json = pivot.results().all()
	var tableObjects = tableToJson($('#pivot-table').get(0))
	console.log(tableObjects)
	var table = tableObjects[1]
	lengths = tableObjects[0]
	if (type === 'json') {
		// alert('Exporting results as ' + type + '.')
		formBlob = new Blob([JSON.stringify(table)], {
			type: 'octet/stream'
		});

		url = window.URL.createObjectURL(formBlob);
	} else if (type === 'csv') {
		// alert('Exporting results as ' + type + '.')
		csv = JSON2CSV(table)
		formBlob = new Blob([csv], {
			type: 'text/csv',
			filename: 'MyVerySpecial.csv'
		});

		url = window.URL.createObjectURL(formBlob);
	} else if (type === 'pdf') {
		// var doc = new jsPDF();
		// doc.fromHTML($('#pivot-table').get(0), .5, .5, {
		//   'width': 500,
		//   'elementHandlers': specialElementHandlers
		// });
		console.log(table)
		// doc.save("results.pdf")
		var doc = new jsPDF('l', 'pt', 'letter', true);
		doc.setFontSize(10)
		doc.cellInitialize();

		$.each(table, function (i, row) {
			if (i == 0) {
				$.each(lengths, function (j, length) {
					doc.setFontStyle('bold')
					doc.cell(10, 200, length * 5 + 13, 20, j, i)

				})
			}
			doc.setFontStyle('normal')
			$.each(row, function (j, cell) {
				// if (i === 0){
				//   doc.setFontStyle('bold')
				//   // console.log(cell.length)
				//   doc.cell(10, 200, lengths[j]*5+13, 20, j, i)

				// }
				// console.log(j)
				// console.log(lengths[j])
				doc.cell(10, 200, lengths[j] * 5 + 13, 20, cell, i + 1);

			})
		})
		// for (row in table){
		//   console.log(row)
		//	 for (cell in row) {
		//		 console.log(cell)
		//		 // doc.cell(10, 200, 100, 20, 'Cell '+k, i);
		//		 // k++;
		//	 }
		// }
		// doc.addJS('print(true)');
		doc.save('results.pdf');
		// use jsPDF library!
	}
	a.href = url;
	a.download = name;
	a.click();
	window.URL.revokeObjectURL(url);
}
function generateReport(type) {
	
}

function drawPoints(coordinates, id) {
	var latlng = ''
	var markerString = '&markers=color:red%7Clabel:P%7C'
	var markers = ''
	var latlngs = []
	var latlngbounds = new google.maps.LatLngBounds()
	if (coordinates[0][0] == undefined){
		latlng = coordinates[1]+","+coordinates[0]
		markers = markerString + latlng
		latlngs.push(new google.maps.LatLng(coordinates[1],coordinates[0]))
	}
	else{
		$.each(coordinates, function (i, coord){
			latlng = coord[1]+","+coord[0]
			markers += markerString + latlng
			latlngs.push(new google.maps.LatLng(coord[1],coord[0]))
		})
	}
	$.each(latlngs, function(i, l){
		latlngbounds.extend(l)
	})
	$('#proj-map').append('<img class="img-thumbnail" title="'+id+'" width="242px" height="242px" src="http://maps.googleapis.com/maps/api/staticmap?center='+latlngbounds.getCenter()+'&zoom=14&size=400x400&sensor=false&format=jpg'+markers+'">')
	
}
function JSON2CSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

	var str = '';
	var line = '';

	if (1){//($("#labels").is(':checked')) {
		var head = array[0];
		if ($("#quote").is(':checked')) {
			for (var index in array[0]) {
				var value = index + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
		} else {
			for (var index in array[0]) {
				line += index + ',';
			}
		}

		line = line.slice(0, -1);
		str += line + '\r\n';
	}

	for (var i = 0; i < array.length; i++) {
		var line = '';

		if (1){//($("#quote").is(':checked')) {
			for (var index in array[i]) {
				var value = array[i][index] + "";
				line += '"' + value.replace(/"/g, '""') + '",';
			}
		} else {
			for (var index in array[i]) {
				line += array[i][index] + ',';
			}
		}

		line = line.slice(0, -1);
		str += line + '\r\n';
	}
	return str;
	
}
function getPathString(arr){
	var points = []
	var latlng = ''
	$.each(arr, function(i, coord){
		var point = new google.maps.LatLng(coord[1],coord[0])
		latlng += '|'+coord[1]+","+coord[0]
		points.push(point)
	})
	return '&path=color:red%7Cenc:' + google.maps.geometry.encoding.encodePath(points)
}

function getNumber(currency){
	return Number(currency.replace(/[^0-9\.]+/g,""));
}

function drawPaths(coordinates, id){
	var latlngString = '';
	var pathString = ''
	if (coordinates[0][0][0] == undefined){
		pathString = getPathString(coordinates)
	}
	else{
		$.each(coordinates, function(i, arr){
			pathString += getPathString(arr)
		})
	}	
	console.log(pathString)
	$('#proj-map').append('<img class="img-thumbnail" title="'+id+'" width="242px" height="242px" src="http://maps.googleapis.com/maps/api/staticmap?size=400x400&sensor=false&format=jpg'+pathString+'&key=AIzaSyB2DmD3aD3d0JIrc31MxUV6U0-Xp4WIE4c">')
}