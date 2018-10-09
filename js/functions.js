
function switch_label_apiname() {
  document.querySelectorAll('.list-field').forEach(function(element) {
    var title = element.getAttribute('title');
    var innerHTML = element.innerHTML;
    element.setAttribute('title', innerHTML);
    element.innerHTML = title;
  });
}

function switch_select() {
  if($(this).is(':checked')) {
    $('#QB_field_sel option[value='+$(this).val()+']').prop("selected", true);
  }
  else {
    $('#QB_field_sel option[value='+$(this).val()+']').prop("selected", false);
  }
}