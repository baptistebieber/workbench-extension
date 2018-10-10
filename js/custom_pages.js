
function generate_event(type, selector) {
  var event = new Event(type);
  document.querySelector(selector).dispatchEvent(event);
}

function parse_query(query) {
  var list_key = ['select','from','where','orderby','limit'];
  var working_query = query.replace('ORDER BY','ORDERBY');
  var parsed_query = {};
  var current_key = '';
  $.each(working_query.split(' '), function(key, value) {
    if(list_key.indexOf(value.toLowerCase()) != -1) {
      current_key = value.toLowerCase();
      parsed_query[current_key] = '';
    }
    else {
      parsed_query[current_key] = parsed_query[current_key] + (parsed_query[current_key] == '' ? '' : ' ') + value;
    }
  });
  if('select' in parsed_query) {
    var s_select = parsed_query['select'];
    parsed_query['select'] = [];
    $.each(s_select.split(','),function(k,v) {
      v = v.trim();
      if(v != '') {
        parsed_query['select'].push(v.trim());
      }
    });
  }
  if('from' in parsed_query) {
    parsed_query['from'] = parsed_query['from'].trim();
  }
  if('where' in parsed_query) {
    var s_where = parsed_query['where'];
    parsed_query['where'] = [];
    $.each(s_where.split(' AND '),function(k,v) {
      parsed_query['where'].push(v.trim());
    });
  }

  return parsed_query;
}

function refresh_query() {
  var sObject = $('#QB_object_sel').val();
  if(sObject != '') {
    var s_query = $('#soql_query_textarea').val();
    var a_query = parse_query(s_query);
    console.log(a_query);
    var object = a_query['from'];
    if(object != sObject) {
      localStorage.setItem('query', s_query);
      $('#QB_object_sel').val(object);
      var event = new Event('change');
      document.querySelector('#QB_object_sel').dispatchEvent(event);
      return;
    }
    $('.input-field:checked').each(function() {
      $(this).click();
    });
    $.each(a_query['select'], function(key, value) {
      if(value != '') {
        $('#'+object+'-'+value).click();
      }
    });

    $('select[name^=QB_filter_field_]').each(function() {
      $(this).val('');
    });
    $('select[name^=QB_filter_compOper_]').each(function() {
      $(this).val('=');
    });
    $('input[name^=QB_filter_value_]').each(function() {
      $(this).val('');
    });
    var i = 0;
    $.each(a_query['where'], function(k, v) {
      var m = v.match(/([A-Za-z0-9_]+) *(=|!=|<|>|<=|>=|LIKE|IN|NOT IN|INCLUDES|EXCLUDES) *(.+)/);
      if(m != null) {
        console.log($('#filter_row_'+i));
        if($('#filter_row_'+i).length == 0) {
          $('#filter_plus_button').click();
        }
        var field = m[1];
        var operator = m[2];
        var value = m[3];
        switch(operator) {
          case '=':
            console.log('=');
            value = value.replace(/'(.*)'/,'$1');
            break;
          case '!=':
            console.log('!=');
            break;
          case '<':
            console.log('<');
            break;
          case '>':
            console.log('>');
            break;
          case '=':
            console.log('=<');
            break;
          case '=':
            console.log('=>');
            break;
          case 'LIKE':
            console.log('LIKE');
            value = value.replace(/'(.*)'/,'$1');
            if(value.substring(0,1) == '%') {
              value = value.substring(1);
              if(value.substring(value.length-1) == '%') {
                value = value.substring(0,value.length-1);
                operator = 'contains';
              }
              else {
                operator = 'ends';
              }
            }
            else if(value.substring(value.length-1) == '%') {
              value = value.substring(0,value.length-1);
              operator = 'starts';
            }
            else {
              operator = '=';
            }
            break;
          case 'IN':
            console.log('IN');
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'NOT IN':
            console.log('NOT IN');
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'INCLUDES':
            console.log('INCLUDES');
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'EXCLUDES':
            console.log('EXCLUDES');
            value = value.replace(/\((.*)\)/,'$1');
            break;
          default:
            break;
        }
        $('#QB_filter_field_'+i).val(field);
        generate_event('change', '#QB_filter_field_'+i);
        $('#QB_filter_compOper_'+i).val(operator);
        generate_event('change', '#QB_filter_compOper_'+i);
        $('#QB_filter_value_'+i).val(value);
        generate_event('keyup', '#QB_filter_value_'+i);
        i++;

      }
    });

    if('orderby' in a_query) {
      var m = a_query['orderby'].match(/([A-Za-z0-9_]+) (ASC|DESC) NULLS (FIRST|LAST)/);
      if(m != null) {
        var field = m[1];
        var typesort = m[2];
        var nulls = m[3];
        $('#QB_orderby_field').val(field);
        $('#QB_orderby_sort').val(typesort);
        $('#QB_nulls').val(nulls);
        generate_event('change', '#QB_nulls');
      }
    }
    if('limit' in a_query) {
      $('#QB_limit_txt').val(a_query['limit']);
        generate_event('keyup', '#QB_limit_txt');
    }
  }
}

function page_query_fields(sObject) {
  var tr = $('<tr>');
  var td = $('<td>Fields:</td>');
  var div = $('<div id="div-list-field"></div>');
  td.attr('colspan', 2);
  var table = $('<table>');
  table.width('100%');
  var i = 0;
  var table_tr;
  $('#QB_field_sel option').each(function(index) {
    if($(this).val() != 'count()') {
      if(i%4 == 0) {
        table_tr = $('<tr>');
      }

      var table_td = $('<td>');
      table_td.addClass('td-field');
      var input = $('<input>');
      input.attr('type', 'checkbox');
      input.attr('id', sObject + '-' + $(this).val());
      input.attr('value', $(this).val());
      input.attr('class', 'input-field');
      input.change(function() {
        if($(this).is(':checked')) {
          $('#QB_field_sel option[value='+$(this).val()+']').prop("selected", true);
        }
        else {
          $('#QB_field_sel option[value='+$(this).val()+']').prop("selected", false);
        }
        var event = new Event('change');
        document.querySelector('#QB_field_sel').dispatchEvent(event);
      });
      var label = $('<label>');
      label.attr('for', sObject + '-' + $(this).val());
      label.text($(this).text());
      label.attr('title', $(this).val());
      label.attr('class', 'label-field');
      label.prepend(input);
      table_td.append(label);

      table_tr.append(table_td);
      i++;
      if(i%4 == 0) {
        table.append(table_tr);
        table_tr = null;
      }
    }
  });
  if(table_tr != null) {
    table.append(table_tr);
  }
  div.append(table);
  td.append(div);
  tr.append(td);
  $('#query_form table tr').first().after(tr);
}

function page_query_soql(sObject) {
  var input = $('<input id="refresh-fields" type="button" name="refresh-fields" value="Refresh" />');
  input.click(function(event) {
    event.preventDefault();
    refresh_query();
  });
  $('input[name=querySubmit]').after(input);
  $('input[name=querySubmit]').after($('<span>&nbsp;|&nbsp;</span>'));
}

function page_query_afterload(sObject) {
  console.log(localStorage.getItem('query'));
  if(localStorage.getItem('query') != null && localStorage.getItem('query') != '') {
     $('#soql_query_textarea').val(localStorage.getItem('query'));
     localStorage.removeItem('query');
  }
  if($('#soql_query_textarea').val() != '') {
    refresh_query();
  }
}

function page_login() {
}

function page_query() {
  var sObject = document.querySelector('#QB_object_sel').value;
  if(sObject != '') {
    page_query_fields(sObject);
  }
  page_query_soql(sObject);
  page_query_afterload(sObject);
}

$(document).ready(function() {

  switch(location.pathname) {
    case '/login.php':
      page_login();
      break;
    case '/query.php':
      page_query();
      break;
    default:
      break;
  }


  // var list_objects = [];
  // $('#QB_object_sel option').each(function() {
  //   list_objects.append($(this).attr('value'));
  // });
  // console.log(list_objects);
  // alert('rouge');

});