/*
 *
 * GKSortables class which is inheriting from the Sortables class
 *
 * It is used to fix the problem with inactive select elements when
 * edit form is opened
 *
 */

var GKSortables = new Class({
	// inherit from the Sortables class
	Extends: Sortables,
	// overrided method
	start: function(event, element){
		if (
			!this.idle ||
			event.rightClick ||
			['button', 'input', 'a', 'textarea'].contains(event.target.get('tag'))
		) return;

		if(element && !element.hasClass('isOpened')) {
			this.idle = false;
			this.element = element;
			this.opacity = element.getStyle('opacity');
			this.list = element.getParent();
			this.clone = this.getClone(event, element);
	
			this.drag = new Drag.Move(this.clone, Object.merge({
				
				droppables: this.getDroppables()
			}, this.options.dragOptions)).addEvents({
				onSnap: function(){
					event.stop();
					this.clone.setStyle('visibility', 'visible');
					this.element.setStyle('opacity', this.options.opacity || 0);
					this.fireEvent('start', [this.element, this.clone]);
				}.bind(this),
				onEnter: this.insert.bind(this),
				onCancel: this.end.bind(this),
				onComplete: this.end.bind(this)
			});
	
			this.clone.inject(this.element, 'before');
			this.drag.start(event);
		}
	}
});


/*
 *
 * Main Tabs GK5 back-end script
 *
 */

// DOMContentLoaded event
window.addEvent("domready",function(){
	// initialize the configuration manager
	var configManager = new TabsGK5ConfigManager();
	// initialize the main class
	var settings = new TabsGK5Settings();
	// check Joomla! version and add suffix
	// check Joomla! version and add suffix
	if(parseFloat((jQuery('#gk_about_us').data('jversion')).substr(0,3)) >= '3.2') {
		jQuery('#module-form').addClass('j32');
	}
	
});

/*
 *
 * Main class
 *
 */
var TabsGK5Settings = new Class({
	// class fields
	options: {
		tabs: null, // tabs data in JSON format
		translations: null, // array for translations
		isDragged: false, // flag for dragging
		sortables: null // Sortables object for tabs
	},
	// constructor
	initialize: function() {
	
		// fix accordian names
		$$('#moduleOptions a[href^="#collapse"]').each(function(el) {
			el.id = el.innerHTML.replace(/ /g,'_').replace('!', '');
		});
		document.id('gk_about_us').getParent().setStyle('margin-left', '15px');
		// helper handler
		$this = this;
		// handlers used in the code
		var add_form = document.id('gk_tab_add_form');
		var add_form_btns = add_form.getElements('.gk_tab_add_submit a');
		var add_form_scroll_wrap = add_form.getElement('.height_scroll');
		// decode the data
		this.options.tabs = JSON.decode(document.id('jform_params_tabs_data').innerHTML);
		// check if the tabs object is null - if yes - fill it with an empty array
		if(this.options.tabs == null || this.options.tabs == '') this.options.tabs = [];
		// put empty array for the translations
		this.options.translations = [];
		// initialize the forms
		this.formInit();
		// current mode
		var sourceMode = document.id('jform_params_module_data_source').get('value');
		// add unvisible class
		if(sourceMode == 'external') {
			if(document.id('Tabs')) { document.id('Tabs').getParent('.accordion-group').addClass('gkUnvisible'); }
		} else {
			if(document.id('External_sources')) { document.id('External_sources').getParent('.accordion-group').addClass('gkUnvisible'); }
		} 
		// hide one of unnecessary tabs
		document.id('jform_params_tabs_data-lbl').getParent().setStyle('display', 'none');
		document.id('jform_params_tabs_data-lbl').getParent().getParent().getElement('.controls').setStyle('margin-left', 0);
		document.id('jform_params_module_data_source').addEvent('change', function() {
			if(sourceMode != document.id('jform_params_module_data_source').get('value')) {
				sourceMode = document.id('jform_params_module_data_source').get('value');
				console.log(sourceMode);
				if(sourceMode == 'external') {
					document.id('Tabs').getParent('.accordion-group').addClass('gkUnvisible');
					document.id('External_sources').getParent('.accordion-group').removeClass('gkUnvisible');
				} else {
					document.id('Tabs').getParent('.accordion-group').removeClass('gkUnvisible');
					document.id('External_sources').getParent('.accordion-group').addClass('gkUnvisible');
				} 
			}
		});
		// function used for changing data source to help if the onChange event doesn't fire
		document.id('jform_params_module_data_source').addEvent('blur', function() {
			document.id('jform_params_module_data_source').fireEvent('change');	
		});
		// get translations texts
		this.options.translations['module_text'] = add_form.getElements('.gk_tab_add_type option')[0].innerHTML;
		this.options.translations['xhtml_text'] = add_form.getElements('.gk_tab_add_type option')[1].innerHTML;
		this.options.translations['published_text'] = document.id('invisible').getElements('.gk_tab_item_state span')[0].innerHTML;
		this.options.translations['unpublished_text'] = document.id('invisible').getElements('.gk_tab_item_state span')[1].innerHTML;
		// hide unnecessary elements
		document.id('invisible').getElements('.gk_tab_item_state span').destroy();
		// set the add form
		if(add_form.getElement('.gk_tab_add_type').get('value') == 'module') {
			add_form.getElement('.gk_tab_add_content_xhtml').setStyle('display', 'none');
			add_form.getElement('.gk_tab_add_content_module').setStyle('display', 'inline-block');
		} else {
			add_form.getElement('.gk_tab_add_content_xhtml').setStyle('display', 'inline-block');
			add_form.getElement('.gk_tab_add_content_module').setStyle('display', 'none');
		}
		// add tab form events
		add_form.getElement('.gk_tab_add_type').addEvent('change', function(){
			if(add_form.getElement('.gk_tab_add_type').value == 'module') {
				add_form.getElement('.gk_tab_add_content_xhtml').setStyle('display', 'none');
				add_form.getElement('.gk_tab_add_content_module').setStyle('display', 'inline-block');
			} else {
				add_form.getElement('.gk_tab_add_content_xhtml').setStyle('display', 'inline-block');
				add_form.getElement('.gk_tab_add_content_module').setStyle('display', 'none');
			}
		});
		// function used to avoid problems with height of the blocks
		var add_form_scroll = new Fx.Tween(add_form_scroll_wrap, { 
			duration: 250, 
			property: 'height', 
			onComplete: function() { 
				if(add_form_scroll_wrap.getSize().y > 0) {
					add_form_scroll_wrap.setStyle('height', 'auto'); 
				} 
			}
		});
		// onClick event for the header in the tabs manager
		document.id('gk_tab_add_header').getElement('a').addEvent('click', function(e) {
			e.stop();
			if(!e.target.hasClass('opened')) {
				e.target.addClass('opened');
				add_form_scroll.start(add_form.getElement('.gk_tab_add').getSize().y);
			} else {
				e.target.removeClass('opened');
				add_form_btns[1].fireEvent('click');
			}
		});
		// cancel button
		add_form_btns[1].addEvent('click', function(e) {
			if(e) e.stop();
			// clear the form
			add_form.getElement('.gk_tab_add_name').set('value', '');
			add_form.getElement('.gk_tab_add_type').set('value', 'xhtml');
			add_form.getElement('.gk_tab_add_content_xhtml').setStyle('display', 'block');
			add_form.getElement('.gk_tab_add_content_module').setStyle('display', 'none');
			add_form.getElement('.gk_tab_add_content_module').set('value', 'tab1');
			add_form.getElement('.gk_tab_add_content_xhtml').set('value', '');
			add_form.getElement('.gk_tab_add_published').set('value', '1');
			add_form.getElement('.gk_tab_add_id').set('value', '');
			add_form.getElement('.gk_tab_add_animation').set('value', 'default');
			add_form.getElement('.gk_tab_add_content_access').set('value', '1');
			// hide the form
			add_form_scroll_wrap.setStyle('height', add_form_scroll_wrap.getSize().y + 'px');
			add_form_scroll.start(0);
			document.id('gk_tab_add_header').getElement('a').removeClass('opened');
		});
		// save button
		add_form_btns[0].addEvent('click', function(e) {
			$this.create_item('new', false);
		});
		// generate the list
		this.options.tabs.each(function(tab) {
			$this.create_item(tab, true);
		});
		// enable drag'n'drop
		$this.options.sortables = new GKSortables(document.id('tabs_list'), {
			clone: true, 
			opacity: 0.5, 
			onStart: function(element, clone) {
				clone.addClass('gk_tab_item_clone');
				var iter = 0;
				document.id('tabs_list').getElements('.gk_tab_item').each(function(el) {
					if(!el.hasClass('gk_tab_item_clone')) {
						el.setProperty('data-order', iter);
						iter++;
					}
				});
				
				document.id('tabs_list').addClass('dragging');
				$this.options.isDragged = true;
			},
			onComplete: function(element) {
				if($this.options.isDragged){
					if(document.id('tabs_list').hasClass('dragging')) {
						document.id('tabs_list').removeClass('dragging');
					}
					// getting new order
					var newOrder = [];
					document.id('tabs_list').getElements('.gk_tab_item').each(function(el, i) {
						if(!el.hasClass('gk_tab_item_clone') && el.getProperty('data-order') != null) {
							newOrder.push(el.getProperty('data-order').toInt());
						}
						el.removeProperty('data-order');
					});
					// make a new order
					var tempTabs = [];
					newOrder.each(function(item,i) {
						tempTabs[i] = $this.options.tabs[item];
					});
					// save new tabs order
					$this.options.tabs = tempTabs;
					// put the data to textarea field
					document.id('jform_params_tabs_data').innerHTML = JSON.encode($this.options.tabs);
					// to avoid problems with opening tab editor
					(function() {
						$this.options.isDragged = false;
					}).delay(100);
				}
			}
		});
	},
	// function to create a new tab item
	create_item: function(source, init) {
		$this = this;
		var add_form = document.id('gk_tab_add_form');
		var add_form_btns = add_form.getElements('.gk_tab_add_submit a');
		// duplicate item structure
		var item = document.id('invisible').getElement('.gk_tab_item').clone();
		// get the values from the form
		var name = (source == 'new') ? add_form.getElement('.gk_tab_add_name').get('value') : source.name;
		var type = (source == 'new') ? add_form.getElement('.gk_tab_add_type').get('value') : source.type;
		var module = (source == 'new') ? add_form.getElement('.gk_tab_add_content_module').get('value') : (source.type == 'module') ? source.content : 'tab1';
		var xhtml = (source == 'new') ? add_form.getElement('.gk_tab_add_content_xhtml').get('value') : source.content;
		var published = (source == 'new') ? add_form.getElement('.gk_tab_add_published').get('value') : source.published;
		var access = (source == 'new') ? add_form.getElement('.gk_tab_add_content_access').get('value') : source.access;
		var id = (source == 'new') ? add_form.getElement('.gk_tab_add_id').get('value') : source.id;
		var animation = (source == 'new') ? add_form.getElement('.gk_tab_add_animation').get('value') : source.animation;
		// put the values to the item
		item.getElement('.gk_tab_item_name').innerHTML = name;
		item.getElement('.gk_tab_item_type').innerHTML = (type == 'module') ? this.options.translations['module_text'] : this.options.translations['xhtml_text'];
		item.getElement('.gk_tab_item_state').setProperty('class', (published == 1) ? 'gk_tab_item_state published' : 'gk_tab_item_state unpublished');
		item.getElement('.gk_tab_item_state').setProperty('title', (published == 1) ? this.options.translations['published_text'] : this.options.translations['unpublished_text']);
		item.getElement('.gk_tab_item_access').innerHTML = add_form.getElement('.gk_tab_add_content_access option[value="'+access+'"]').innerHTML;
		item.getElement('.gk_tab_item_access').setProperty("title", add_form.getElement('.gk_tab_add_content_access option[value="'+access+'"]').innerHTML);
		//
		// add the events to the item buttons
		//
		// fill the edit form
		item.getElement('.gk_tab_edit_name').set('value', name);
		item.getElement('.gk_tab_edit_type').set('value', type);
		item.getElement('.gk_tab_edit_content_access').set('value', access);
		item.getElement('.gk_tab_edit_published').set('value', published);
		item.getElement('.gk_tab_edit_content_xhtml').set('value', this.htmlspecialchars_decode(xhtml));
		item.getElement('.gk_tab_edit_content_module').set('value', module);
		item.getElement('.gk_tab_edit_id').set('value', id);
		item.getElement('.gk_tab_edit_animation').set('value', animation);
		// edit
		item.getElement('.gk_tab_item_desc').addEvent('click', function(e){
			if(e) e.stop();
			
			if(!$this.options.isDragged) {
				var scroller = item.getElement('.gk_tab_editor_scroll');
				scroller.setStyle('height', scroller.getSize().y + "px");
				var fx = new Fx.Tween(scroller, { duration: 250, property: 'height', onComplete: function() { if(scroller.getSize().y > 0) scroller.setStyle('height', 'auto'); } });
				
				if(scroller.getSize().y > 0) {
					fx.start(0);
					item.removeClass('isOpened');
				} else {
					item.getParent().getElements('.gk_tab_item').each(function(it) {
						if(it != item) it.getElements('.gk_tab_edit_submit a')[1].fireEvent('click');
					});
				
					fx.start(scroller.getElement('div').getSize().y);
					item.addClass('isOpened');
				}
			}
		});
		// publish / unpublish
		item.getElement('.gk_tab_item_state').addEvent('click', function(e) {
			if(e) e.stop();
			var btn = item.getElement('.gk_tab_item_state');
			item.getElement('.gk_tab_edit_published').set('value', btn.hasClass('published') ? 0 : 1);
			btn.setProperty('class', btn.hasClass('published') ? 'gk_tab_item_state unpublished' : 'gk_tab_item_state published');
			btn.setProperty('title', $this.options.translations[btn.hasClass('published') ? 'unpublished_text' : 'published_text']);
			item.getElements('.gk_tab_edit_submit a')[0].fireEvent('click');
		});
		// set the content of the form
		var itemMode = item.getElement('.gk_tab_edit_type').get('value');
		item.getElement('.gk_tab_edit_content_xhtml').setStyle('display', itemMode == 'module' ? 'none' : 'inline-block');
		item.getElement('.gk_tab_edit_content_module').setStyle('display', itemMode == 'module' ? 'inline-block' : 'none');
		// change event
		item.getElement('.gk_tab_edit_type').addEvent('change', function(){
			var itemMode = item.getElement('.gk_tab_edit_type').get('value');
			item.getElement('.gk_tab_edit_content_xhtml').setStyle('display', itemMode == 'module' ? 'none' : 'inline-block');
			item.getElement('.gk_tab_edit_content_module').setStyle('display', itemMode == 'module' ? 'inline-block' : 'none');
		});
		// remove
		item.getElements('.gk_tab_item_remove').addEvent('click', function(e){
			if(e) e.stop();
			// get the item ID on list
			var item_id = item.getParent().getElements('.gk_tab_item').indexOf(item);
			// remove the object from the JSON array
			$this.options.tabs.splice(item_id, 1);
			// remove the item from list
			item.destroy();
			// put the data to textarea field
			document.id('jform_params_tabs_data').innerHTML = JSON.encode($this.options.tabs);
		});
		// cancel edit
		item.getElements('.gk_tab_edit_submit a')[1].addEvent('click', function(e) {
			if(e) e.stop();
			// hide the form
			var scroller = item.getElement('.gk_tab_editor_scroll');
			scroller.setStyle('height', scroller.getSize().y + "px");
			new Fx.Tween(scroller, { duration: 250, property: 'height' }).start(0);
			item.removeClass('isOpened');
		});
		// save edit
		item.getElements('.gk_tab_edit_submit a')[0].addEvent('click', function(e) {
			if(e) e.stop();
			// get the data from editor
			var name = item.getElement('.gk_tab_edit_name').get('value');
			var type = item.getElement('.gk_tab_edit_type').get('value');
			var access = item.getElement('.gk_tab_edit_content_access').get('value');
			var published = item.getElement('.gk_tab_edit_published').get('value');
			var xhtml = item.getElement('.gk_tab_edit_content_xhtml').get('value');
			var module = item.getElement('.gk_tab_edit_content_module').get('value');
			var id = item.getElement('.gk_tab_edit_id').get('value');
			var animation = item.getElement('.gk_tab_edit_animation').get('value');
			// set the data in the JSON object
			var items = item.getParent().getElements('.gk_tab_item');
			var item_id = items.indexOf(item);
			$this.options.tabs[item_id] = {
				"name" : name,
				"type" : type,
				"content" : (type == 'module') ? module : $this.htmlspecialchars(xhtml),
				"published" : published,
				"access" : access,
				"id": id,
				"animation": animation
			};
			// update the item content
			item.getElement('.gk_tab_item_name').innerHTML = name;
			item.getElement('.gk_tab_item_type').innerHTML = (type == 'module') ? $this.options.translations['module_text'] : $this.options.translations['xhtml_text'];
			item.getElement('.gk_tab_item_state').setProperty('class', (published == 1) ? 'gk_tab_item_state published' : 'gk_tab_item_state unpublished');
			item.getElement('.gk_tab_item_state').setProperty('title', (published == 1) ? $this.options.translations['published_text'] : $this.options.translations['unpublished_text']);
			item.getElement('.gk_tab_item_access').innerHTML = add_form.getElement('.gk_tab_add_content_access option[value="'+access+'"]').innerHTML;
			item.getElement('.gk_tab_item_access').setProperty("title", add_form.getElement('.gk_tab_add_content_access option[value="'+access+'"]').innerHTML);
			// hide the form
			item.getElements('.gk_tab_edit_submit a')[1].fireEvent('click');
			// put the data to textarea field
			document.id('jform_params_tabs_data').innerHTML = JSON.encode($this.options.tabs);
			item.removeClass('isOpened');
		});
		// put the data to object
		if(source == 'new') { // only new objects
			this.options.tabs.push({
				"name" : name,
				"type" : type,
				"content" : (type == 'module') ? module : this.htmlspecialchars(xhtml),
				"published" : published,
				"access" : access,
				"id": id,
				"animation": animation
			});
			// clear and hide the form
			add_form_btns[1].fireEvent('click');
			// put the data to textarea field
			document.id('jform_params_tabs_data').innerHTML = JSON.encode($this.options.tabs);
		}
		// put the item to the list
		item.inject(document.id('tabs_list'), 'bottom');
		// add the new element to the sortables list
		if(!init && document.id('tabs_list').getElement('.gk_tab_item')) {
			this.options.sortables.addItems(document.id('tabs_list').getLast('.gk_tab_item'));
		}
	},
	// function used to make other adjustments in the form
	formInit: function() {
		
		
		
		document.id('config_manager_form').getParent().setStyle('margin', '0');
		// adjust the inputs
		$$('.input-pixels').each(function(el){el.getParent().innerHTML = "<div class=\"input-prepend\">" + el.getParent().innerHTML + "<span class=\"add-on\">px</span></div>"});
		$$('.input-ms').each(function(el){el.getParent().innerHTML = "<div class=\"input-prepend\">" + el.getParent().innerHTML + "<span class=\"add-on\">ms</span></div>"});
		$$('.input-percents').each(function(el){el.getParent().innerHTML = "<div class=\"input-prepend\">" + el.getParent().innerHTML + "<span class=\"add-on\">%</span></div>"});
		$$('.input-minutes').each(function(el){el.getParent().innerHTML = "<div class=\"input-prepend\">" + el.getParent().innerHTML + "<span class=\"add-on\">minutes</span></div>"});
			
	},
	// function to encode chars
	htmlspecialchars: function(string) {
	    string = string.toString();
	    string = string.replace(/&/g, '[ampersand]').replace(/</g, '[leftbracket]').replace(/>/g, '[rightbracket]');
	    return string;
	},
	// function to decode chars
	htmlspecialchars_decode: function(string) {
		string = string.toString();
		string = string.replace(/\[ampersand\]/g, '&').replace(/\[leftbracket\]/g, '<').replace(/\[rightbracket\]/g, '>');
		return string;
	}
});

/*
 *
 * Configuration manager class
 *
 */
var TabsGK5ConfigManager = new Class({
	// constructor
	initialize: function() {
		// create additional variable to avoid problems with the scopes
		$obj = this;
		// button load
		document.id('config_manager_load').addEvent('click', function(e) {
			e.stop();
		    $obj.operation('load');
		});
		// button save
		document.id('config_manager_save').addEvent('click', function(e) {
			e.stop();
		   	$obj.operation('save');
		});
		// button delete
		document.id('config_manager_delete').addEvent('click', function(e) {
			e.stop();
		   	$obj.operation('delete');
		});
	},
	// operation made by the class
	operation: function(type) {
		// current url 
		var current_url = window.location;
		// check if the current url has no hashes
		if((current_url + '').indexOf('#', 0) === -1) {
			// if no - put the variables
		    current_url = current_url + '&gk_module_task='+type+'&gk_module_file=' + document.id('config_manager_'+type+'_filename').get('value');    
		} else {
			// if the url has hashes - remove the hash 
		    current_url = current_url.substr(0, (current_url + '').indexOf('#', 0) - 1);
		    // and put the variables
		    current_url = current_url + '&gk_module_task='+type+'&gk_module_file=' + document.id('config_manager_'+type+'_filename').get('value');
		}
		// redirect to the url with variables
		window.location = current_url;
	} 
});