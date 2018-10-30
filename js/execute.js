function custom_log(msg) {
  console.info('%c[Workbench Extension]:'+'%c ' + msg, 'background:#999999;color:#FFFFFF', 'background:none;color:inherit');
}


var list_script = {
  tasks: {
    'name': 'Tasks',
    'code': 'System.debug([SELECT Id FROM Task]);'
  },
  accounts: {
    'name': 'Accounts',
    'code': 'System.debug([SELECT Id FROM Account]);'
  }
};


function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function add_script(slug) {

  var li = $('<li></li>');
  li.attr('id', slug);
  li.addClass('item-script');

  var span = $('<span></span>')
  span.text(list_script[slug].name);
  span.click(function(event) {
    event.preventDefault();
    custom_log('Load script "' + slug + '"');
    $('#scriptInput').val(list_script[slug].code);
  });
  li.append(span);

  var a = $('<a class="remove-script">X</a>')
  a.click(function(event) {
    event.preventDefault();
    var r = confirm('Are you sur to delete the script "' + list_script[slug].name + '"');
    if(r) {
      custom_log('Delete script "' + slug + '"');
      delete list_script[slug];
      localStorage.setItem('list_script', JSON.stringify(list_script));
      li.remove();
    }
  });
  li.append(a);

  $('#list-script').append(li);
}

function save_script(name) {
  var slug = slugify(name);
  var code = $('#scriptInput').val();
  list_script[slug] = {
    name: name,
    code: code
  };
  custom_log('New script "' + slug + '"');
  add_script(slug);
  localStorage.setItem('list_script', JSON.stringify(list_script));
}

function load_list_script() {

  var storage = localStorage.getItem('list_script');
  if(storage == '' || storage == null) {
    storage = '{}';
  }

  list_script = JSON.parse(storage);
  

  $.each(list_script, function(slug, script) {
    add_script(slug);
  });
}

function clean_page() {
  var width = $('#scriptInput').parent().width();
  console.log($('#scriptInput').parents('table'));
  $('#scriptInput').parents('table').css('width','100%');
  var i = 0;
  $('#scriptInput').parents('table').find('td').each(function() {
    $(this).attr('colspan',null).css('width',width)
    $(this).after($('<td id="second-td-'+i+'" class="second-td"></td>'));
    i++;
  });
}

function page_execute() {

  clean_page();

  var ul = $('<ul id="list-script"></ul>');
  $('#second-td-2').css('vertical-align', 'top').append(ul);
  load_list_script();

  var add_button = $('<button>Save this script</button>');
  add_button.attr('id', 'add-script');
  add_button.click(function(event) {
    event.preventDefault();
    if($('#scriptInput').val() != "") {
      var name = prompt('Please enter the name of the script');
      if (name != null && name != '') {
        save_script(name)
      }
    }
  });
  $('#second-td-1').append(add_button);
}

$(document).ready(function() {
  custom_log('execute.js');
  page_execute();
});