
var list_fields = [];
var map_fields = {};
var running = false;

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
      if(v == 'count()') {
        v = 'count';
      }
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
    // console.log(a_query);
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
        // console.log($('#filter_row_'+i));
        if($('#filter_row_'+i).length == 0) {
          $('#filter_plus_button').click();
        }
        var field = m[1];
        var operator = m[2];
        var value = m[3];
        switch(operator) {
          case '=':
            value = value.replace(/'(.*)'/,'$1');
            break;
          case '!=':
            break;
          case '<':
            break;
          case '>':
            break;
          case '=':
            break;
          case '=':
            break;
          case 'LIKE':
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
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'NOT IN':
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'INCLUDES':
            value = value.replace(/\((.*)\)/,'$1');
            break;
          case 'EXCLUDES':
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
  var td = $('<td colspan="2">Fields:</td>');


  var div = $('<div></div>');
  var table = $('<table>');
  table.width('100%');
  var table_tr;
  var table_td;

  table_tr = $('<tr>');
  //############### Create Select All ##################
  table_td = $('<td colspan="2">');
  var label_select_all = $('<label for="select-all">All</label>');
  var input_select_all = $('<input id="select-all" type="checkbox"/>');
  input_select_all.change(function() {
    var me = false;
    if(!running) {
      running = true;
      me = true;
    }

    var is_check = $(this).is(':checked')
    if($('#'+sObject+'-count:checked') != null) {
      $('#'+sObject+'-count:checked').click();
    }
    $('.input-field').each(function() {
      if($(this).is(':checked') && !is_check) {
        $(this).click();
      }
      else if(!$(this).is(':checked') && is_check) {
        $(this).click();
      }
    });

    if(me) {
      running = false;
    }
  });
  label_select_all.prepend(input_select_all);
  table_td.append(label_select_all);
  table_tr.append(table_td);
  table_td = null;


  //############### Create Find ##################
  table_td = $('<td colspan="2">');
  var input_search = $('<input id="input-search" type="text" placeholder="Search" />');

  input_search.keyup(function() {
    var val_filter = $(this).val();
    if(val_filter.length > 0) {
      var list_visible = list_fields.filter(function(v) {
        return v.toLowerCase().match(val_filter.toLowerCase());
      });
      var list_hide = list_fields.filter(function(v) {
        return v.toLowerCase().match(val_filter.toLowerCase()) == null;
      });
      // console.log(list_visible);
      // console.log(list_hide);

      $.each(list_visible, function(k,v) {
        map_fields[v].show();
      });
      $.each(list_hide, function(k,v) {
        map_fields[v].hide();
      });
    }
    else {
      $.each(map_fields, function(k,v) {
        v.show();
      });
    }
  });

  input_search.keypress(function(event) {
    if(event.keyCode == '13') {
      event.preventDefault();
    }
  });

  table_td.append(input_search);
  table_tr.append(table_td);
  table_td = null;


  //############### Insert First Line ##################
  table.append(table_tr);
  table_tr = $('<tr>');
  table_td = $('<td colspan="4">');
  var tmp_div = $('<div id="div-list-field"></div>');

  //############### Insert Fields ##################
  $('#QB_field_sel option').each(function(index) {
    var this_val = $(this).val();
    if(this_val == 'count()') {
      this_val = 'count';
    }
    var id = 'option-' + this_val;
    $(this).attr('id', id);

    list_fields.push(this_val);

    var input = $('<input>');
    input.attr('type', 'checkbox');
    input.attr('id', sObject + '-' + this_val);
    input.attr('value', this_val);

    if(this_val != 'count') {
      input.addClass('input-field');
    }
    input.addClass('filter-field');

    input.change(function() {
      var me = false;
      if(!running) {
        running = true;
        me = true;
      }

      var new_val = false;

      if($(this).is(':checked')) {
        new_val = true;
      }

      if(me && new_val) {
        if(this_val == 'count' && new_val) {
          $('.input-field:checked').each(function() {
            $(this).click();
          });
        }
        else if(this_val != 'count' && $('#'+sObject+'-count:checked') != null) {
          $('#'+sObject+'-count:checked').click();
        }
      }

      $('#option-'+$(this).val()).prop("selected", new_val);
      if(me) {
        running = false;
      }

      var event = new Event('change');
      document.querySelector('#QB_field_sel').dispatchEvent(event);
    });

    var label = $('<label>');
    label.attr('for', sObject + '-' + this_val);
    label.text($(this).text());
    label.attr('title', this_val);
    label.attr('class', 'label-field');
    label.prepend(input);

    var div_field = $('<div>');
    div_field.addClass('div-field');
    div_field.append(label);

    map_fields[this_val] = div_field;
    tmp_div.append(div_field);
  });

  table_td.append(tmp_div);
  table_tr.append(table_td);
  table.append(table_tr);
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
  if(localStorage.getItem('query') != null && localStorage.getItem('query') != '') {
     $('#soql_query_textarea').val(localStorage.getItem('query'));
     localStorage.removeItem('query');
  }
  if($('#soql_query_textarea').val() != '') {
    refresh_query();
  }
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
  console.info('%c[Workbench Extension]:'+'%c query.js', 'background:#999999;color:#FFFFFF', 'background:none;color:inherit');
  page_query();
});