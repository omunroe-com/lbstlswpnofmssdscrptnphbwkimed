function sendForm() {
    swal("Sending", "Your labels&desciptions are being sent to Wikidata.org", "success");
	$('#send').disabled = true;
	var items = $("input[name^='new_label_']");
	var payload = [];
	for (var i = 0; i < items.length; i++) {
		var label = items[i].value;
		var description = $("input[name=" + items[i].name.replace('label', 'description') + "]").val();
		var qid = items[i].name.replace('new_label_', '');
		var imagepayload = {
				'label': label,
				'description': description,
				'qid': qid,
				'lang': $('#langs').val()
		};
		payload.push(imagepayload);
		console.log(qid);
	}
	$.postJSON('https://tools.wmflabs.org/weapon-of-mass-description/api-edit', payload, function (data) {
		console.log(data);
		$('#send')[0].disabled = false;
		$('tbody').empty();
		$('#items').val("");
	}).done(function() {
        swal("Saved", "Your labels&desciptions should be now live on Wikidata.org", "success");
    })
}

function fillItems() {
	$('tbody').empty();
	var items = $('#items').val().split('\n');
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var url = 'https://tools.wmflabs.org/weapon-of-mass-description/api-item?item=' + item + '&lang=' + $('#langs').val();
		if ($('#spokablelangs').val() != "") {
			url += "&langs=" + $('#spokablelangs').val().replaceAll('\n', '|');
		}
		$.getJSON(url, function (data) {
			var item = data.items[0].qid;
			var labelhtml = "<ul>";
			for (var j = 0; j < data.items[0].labels.length; j++) {
				var lang = data.items[0].labels[j].language;
				var label = data.items[0].labels[j].value;
				labelhtml += '<li>' + lang + ': <span class="label" id="label-' + item + '-' + lang + '">' + label + '</span> (<a class="copy-label" data-value="' + label + '" data-item="' + item + '" data-lang="' + lang + '" id="copy-label-' + lang + '-' + item + '" href="#">copy to new label</a>)</li>';
			}
			labelhtml += "</ul>";
			var descriptionhtml = "<ul>"
			for (var j = 0; j < data.items[0].descriptions.length; j++) {
				var lang = data.items[0].descriptions[j].language;
				var description = data.items[0].descriptions[j].value;
				descriptionhtml += '<li>' + lang + ': <span class="description" id="description-' + item + '-' + lang + '">' + description + '</span></li>';
			}
			descriptionhtml += "</ul>";
			var enableDescription = "";
			if (data.items[0].enableDescription == false) {
				enableDescription = "disabled";
			}
			var enableLabel = "";
			if (data.items[0].enableLabel == false) {
				enableLabel = "disabled";
			}
			var html = `
			<tr>
					<td><a href="https://wikidata.org/entity/` + item + `">` + item + `</a></td>
					<td>
							<div class="input-field">
									<input ` + enableLabel + ` placeholder="new label" name="new_label_` + item + `" type="text">
							</div>
					<td>
							<div class="input-field">
									<input ` + enableDescription + ` placeholder="new description" name="new_description_` + item + `" type="text">
							</div>
					</td>
					<td>Wikipedia</td>
					<td id="autodesc-` + item + `"></td>
					<td>` + labelhtml + `</td>
					<td>` + descriptionhtml + `</td>
			</tr>`;
			$('tbody').append(html);
			var url = "https://tools.wmflabs.org/autodesc?q=" + item + "&lang=" + $('#langs').val() + "&mode=short&links=text&redlinks=&format=json&get_infobox=yes&infobox_template=";
			$.getJSON(url, function (data) {
				var id = "autodesc-" + data.q;
				$('#' + id).html(data.result + ' (<a href="#" class="copy-autodesc" data-value="' + data.result + '" data-item="' + data.q + '">copy to new description</a>)');
			})
		});
		$('#send')[0].disabled = false;
	}
}

function suggestItems() {
	var wiki = $('#langs').val() + 'wiki';
	var url = 'https://tools.wmflabs.org/weapon-of-mass-description/api-suggestitems?wiki=' + wiki + '&num=' + $('#loaditems').val();
	$.getJSON(url, function (data) {
		var items = data.items;
		$('#items').val("");
		var itemstr = "";
		for (var i = 0; i < items.length; i++) {
			itemstr += items[i] + "\n";
		}
		$('#items').val(itemstr);
	}).done(function() {
        fillItems();
    })

}



$(function() {
    $("body").on('click','.copy-label', function(event){
        item = $(this).data('item');
        lang = $(this).data('lang');
        value = $(this).data('value');
        $('input[name="new_label_' + item + '"]').val(value);
        event.preventDefault();
    });
});

$(function() {
  $("body").on('click', '.copy-autodesc', function (event) {
    item = $(this).data('item');
    value = $(this).data('value');
    if ($('input[name="new_description_' + item + '"]')[0].disabled == false) {
      $('input[name="new_description_' + item + '"]').val(value);
    }
    event.preventDefault();
  })
});

$( document ).ready(function() {
	$.getJSON('https://tools.wmflabs.org/weapon-of-mass-description/api-langs', function (data) {
		for (var i = 0; i < data['langs'].length; i++) {
			if (data['langs'][i]['code'] == 'cs') {
				var row = '<option value="' + data['langs'][i]['code'] + '" selected>' + data['langs'][i]['name'] + '</option>';
			}
			else {
				var row = '<option value="' + data['langs'][i]['code'] + '">' + data['langs'][i]['name'] + '</option>';
			}
			$('#langs').append(row);
		}
	});
});
