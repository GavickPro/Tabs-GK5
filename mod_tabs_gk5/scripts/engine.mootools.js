window.addEvent('load', function(){
	document.getElements('.gkTabsGK5').each(function(el,i){
		var module_id = el.getProperty('id');
		var config = JSON.decode(el.get('data-config')); 
		var tabs = el.getElements('.gkTabsItem');
		var items = el.getElements('.gkTabsNav li');
		var tabs_wrapper = el.getElement('.gkTabsContainer');
		var tabs_wrapper_anim = new Fx.Tween(tabs_wrapper, {
															duration: config['animation_speed'], 
															property: 'height', 
															wait: 'ignore', 
															onComplete: function() { 
																this.element.setStyle('height', 'auto');
																tabs[previous_tab].setStyles({
																	'position': 'absolute',
																	'top': '0'
																});	 
															}
														});
		var animation = (config['animation'] == 0) ? true : false;
		var current_tab = config['active_tab'] - 1;
		var previous_tab = null;
		var eventActivator = config['activator'];
		var amount = tabs.length;
		var timer = false;
		var blank = false;
		var falsy_click = false;
		var animation_type = config['animation_type'];
		var tab_animation = [];
		// prepare tabs animation
		tabs.each(function(tab, i){ 
			tab_animation[i] = new Fx.Morph(tab, {duration: config['animation_speed'], wait: 'ignore'});
		});
			
		tabs_wrapper.setStyle('height', tabs[config['active_tab']-1].getSize().y + "px");
		tabs.setStyle('opacity', 0);
		tabs[config['active_tab']-1].setStyles({
			'opacity': '1',
			'position': 'relative',
			'z-index': 2
		});
		// set the fixed height
		if(config['auto_height'] == '0') {
			tabs_wrapper.setStyle('height', config['module_height'] + 'px');
		}
		// add events to tabs
		items.each(function(item, i){
			item.addEvent(eventActivator, function(){
				if(i != current_tab) {
					previous_tab = current_tab;
					current_tab = i;
					
					if(config['auto_height'] == '1') {
						tabs_wrapper.setStyle('height', tabs_wrapper.getSize().y + 'px');
					}
					
					var previous_animation = items[previous_tab].get('data-animation');
					if(previous_animation == 'default') previous_animation = config['animation_type'];
					var previous_tab_animation = { 'opacity': 0 };
					var current_animation = items[current_tab].get('data-animation');
					if(current_animation == 'default') current_animation = config['animation_type'];
					var current_tab_animation = { 'opacity': 1 };
					//
					if(previous_animation == 'slide_horizontal') {
						previous_tab_animation['left'] = -1 * tabs[previous_tab].getSize().x;
					} else if(previous_animation == 'slide_vertical') {
						previous_tab_animation['top'] = -1 * tabs[previous_tab].getSize().y;
					} 
					//
					if(current_animation == 'slide_horizontal') {
						current_tab_animation['left'] = 0;
					} else if(current_animation == 'slide_vertical') {
						current_tab_animation['top'] = 0;
					}
					//
					tab_animation[previous_tab].start(previous_tab_animation);
					tabs[previous_tab].setStyles({
						'z-index': '1'
					});
					//
					tabs[previous_tab].removeClass('active');
					tabs[current_tab].addClass('active');
					//
					if(config['auto_height'] == '1') {
						tabs_wrapper_anim.start(tabs_wrapper.getSize().y, tabs[i].getSize().y);
					} else {
						tabs[previous_tab].setStyles({
							'position': 'absolute',
							'top': '0'
						});
					}
					//
					(function(){
						//
						if(current_animation == 'slide_horizontal') {
							tabs[current_tab].setStyle('left', tabs[current_tab].getSize().x);
						} else if(current_animation == 'slide_vertical') {
							tabs[current_tab].setStyle('top', tabs[current_tab].getSize().y);
						}
						// anim
						tab_animation[current_tab].start(current_tab_animation);
						
						tabs[current_tab].setStyles({
							'position': 'relative',
							'z-index': '2'
						});
					}).delay(config['animation_speed']);
					
					// external trigger
					if(typeof gkTabEventTrigger !== 'undefined') {
						gkTabEventTrigger(i, current_tab, module_id);
					}
					// common operations for both types of animation
					if(!falsy_click) blank = true;
					else falsy_click = false;
					items[previous_tab].removeClass('active');
					items[current_tab].addClass('active');
					if(config['cookie_save'] == 1) {
						Cookie.write('gktab-' + module_id, i + 1, { domain: '/', duration: 256 });
					}
				}
			});
		});
		// add events to buttons
		if(el.getElement('.gkTabsButtonNext')) {
			el.getElement('.gkTabsButtonNext').addEvent('click', function() {
				if(current_tab < amount - 1) items[current_tab + 1].fireEvent(eventActivator);	
				else items[0].fireEvent(eventActivator);
			});
			
			el.getElement('.gkTabsButtonPrev').addEvent('click', function() {
				if(current_tab > 0) items[current_tab - 1].fireEvent(eventActivator);	
				else items[amount - 1].fireEvent(eventActivator);
			});
		}
		//
		if(config["animation"] == 1) {
			timer = (function(){
				if(!blank) {
					falsy_click = true;
					if(current_tab < amount - 1) items[current_tab + 1].fireEvent(eventActivator);	
					else items[0].fireEvent(eventActivator);
				} else {
					blank = false;
				}
			}).periodical(config["animation_interval"]);
		}
	});
});